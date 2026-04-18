import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  type SavedApp,
  fetchBuiltApps,
  fetchDraftApps,
} from "./api/fetch-apps";
import AppIcon from "./components/AppIcon";
import SideMenu from "./components/SideMenu";

type Tab = "home" | "store" | "history" | "drafts";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "ホーム" },
  { id: "store", label: "ストア" },
  { id: "history", label: "履歴" },
  { id: "drafts", label: "ドラフト" },
];

const NUM_COLUMNS = 4;
const SCREEN_WIDTH = Dimensions.get("window").width;
const ICON_CELL = (SCREEN_WIDTH - 32) / NUM_COLUMNS;

type Props = {
  onNewChat: (initialText: string) => void;
  onOpenApp: (app: SavedApp) => void;
};

export default function HomeScreen({ onNewChat, onOpenApp }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [builtApps, setBuiltApps] = useState<SavedApp[]>([]);
  const [draftApps, setDraftApps] = useState<SavedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [inputText, setInputText] = useState("");

  const gridOpacity = useRef(new Animated.Value(1)).current;
  const tabScrollRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [built, drafts] = await Promise.all([
        fetchBuiltApps(),
        fetchDraftApps(),
      ]);
      setBuiltApps(built);
      setDraftApps(drafts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleChatFocus = () => {
    Animated.timing(gridOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onNewChat(inputText);
    });
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    Animated.timing(gridOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onNewChat(inputText);
    });
  };

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
    const idx = TABS.findIndex((t) => t.id === tab);
    tabScrollRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: true });
  };

  const renderBuiltGrid = () => (
    <FlatList
      data={builtApps}
      numColumns={NUM_COLUMNS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.gridContent}
      columnWrapperStyle={styles.gridRow}
      scrollEnabled={false}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            まだビルド済みのアプリがありません{"\n"}
            下の入力欄からアプリを作ってみましょう！
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable style={styles.iconCell} onPress={() => onOpenApp(item)}>
          <AppIcon
            iconName={item.icon_name}
            iconImageUrl={item.icon_image_url}
            label={item.name ?? item.title}
            size={ICON_CELL * 0.7}
          />
          <Text style={styles.iconLabel} numberOfLines={1}>
            {item.name ?? item.title}
          </Text>
        </Pressable>
      )}
    />
  );

  const renderDraftGrid = () => (
    <FlatList
      data={draftApps}
      numColumns={NUM_COLUMNS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.gridContent}
      columnWrapperStyle={styles.gridRow}
      scrollEnabled={false}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>ドラフトはありません</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable style={styles.iconCell} onPress={() => onOpenApp(item)}>
          <AppIcon
            iconName={item.icon_name}
            iconImageUrl={item.icon_image_url}
            label={item.title}
            size={ICON_CELL * 0.7}
            backgroundColor="#aaa"
          />
          <Text style={styles.iconLabel} numberOfLines={1}>
            {item.title}
          </Text>
        </Pressable>
      )}
    />
  );

  const renderStorePlaceholder = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>ストアは近日公開予定です</Text>
    </View>
  );

  const renderHistoryPlaceholder = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>チャット履歴は近日公開予定です</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.hamburger}
          onPress={() => setSideMenuVisible(true)}
        >
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </Pressable>

        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map((tab) => (
            <Pressable
              key={tab.id}
              style={styles.tab}
              onPress={() => handleTabPress(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.id && <View style={styles.tabIndicator} />}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Animated.View style={[styles.content, { opacity: gridOpacity }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeTab === "home" && renderBuiltGrid()}
          {activeTab === "store" && renderStorePlaceholder()}
          {activeTab === "history" && renderHistoryPlaceholder()}
          {activeTab === "drafts" && renderDraftGrid()}
        </ScrollView>
      </Animated.View>

      <View style={styles.chatBar}>
        <TextInput
          style={styles.chatInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="どんなアプリを作りますか？"
          placeholderTextColor="#aaa"
          onFocus={handleChatFocus}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>送信</Text>
        </Pressable>
      </View>

      <SideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        onChatHistory={() => setSideMenuVisible(false)}
        onSettings={() => setSideMenuVisible(false)}
        onAccount={() => setSideMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  hamburger: { padding: 12, gap: 5, justifyContent: "center" },
  hamburgerLine: {
    width: 22,
    height: 2,
    backgroundColor: "#1a1a1a",
    borderRadius: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingRight: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
    position: "relative",
  },
  tabText: { fontSize: 14, color: "#888" },
  tabTextActive: { color: "#007AFF", fontWeight: "600" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: "#007AFF",
    borderRadius: 1,
  },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 16 },
  gridContent: { padding: 16 },
  gridRow: { marginBottom: 8 },
  iconCell: {
    width: ICON_CELL,
    alignItems: "center",
    paddingVertical: 8,
    gap: 6,
  },
  iconLabel: {
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    width: ICON_CELL - 4,
  },
  empty: { flex: 1, alignItems: "center", paddingTop: 80 },
  emptyText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  chatBar: {
    flexDirection: "row",
    padding: 12,
    paddingBottom: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendButtonDisabled: { backgroundColor: "#ddd" },
  sendButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
