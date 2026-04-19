import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowUp,
  Bell,
  Clock,
  FileText,
  House,
  Menu,
  ShoppingBag,
} from "lucide-react-native";
import {
  type SavedApp,
  fetchBuiltApps,
  fetchDraftApps,
} from "./api/fetch-apps";
import AppIcon from "./components/AppIcon";
import SideMenu from "./components/SideMenu";

type Tab = "home" | "store" | "history" | "drafts";

const TABS: Tab[] = ["home", "store", "history", "drafts"];
const TAB_LABELS = ["ホーム", "ストア", "履歴", "ドラフト"];
const TAB_ICONS = [House, ShoppingBag, Clock, FileText];

const NUM_COLUMNS = 4;
const SCREEN_WIDTH = Dimensions.get("window").width;
const ICON_CELL = (SCREEN_WIDTH - 32) / NUM_COLUMNS;
const TAB_ICON_SIZE = 24;
const TAB_SPACING = 72;
const TAB_BAR_HEIGHT = 60;
// Active icon always sits at horizontal center of screen
const TAB_CENTER = SCREEN_WIDTH / 2 - TAB_ICON_SIZE / 2;
const SWIPE_THRESHOLD = 50;

type Props = {
  onNewChat: (initialText: string) => void;
  onOpenApp: (app: SavedApp) => void;
  email?: string;
};

export default function HomeScreen({ onNewChat, onOpenApp, email }: Props) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [builtApps, setBuiltApps] = useState<SavedApp[]>([]);
  const [draftApps, setDraftApps] = useState<SavedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  // Tab carousel animation: translateX shifts all icons so active is centered
  const insets = useSafeAreaInsets();
  const tabContainerX = useRef(new Animated.Value(TAB_CENTER)).current;
  const scrimOpacity = useRef(new Animated.Value(0)).current;
  // Ref so panResponder (created once) always reads current tab index
  const activeTabIdxRef = useRef(0);
  const setSideMenuVisibleRef = useRef((v: boolean) => setSideMenuVisible(v));
  const inputRef = useRef<TextInput>(null);

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run only on mount
  useEffect(() => {
    load();
  }, [load]);

  const switchTab = (idx: number) => {
    if (idx < 0 || idx >= TABS.length) return;
    activeTabIdxRef.current = idx;
    setActiveTabIdx(idx);
    Animated.spring(tabContainerX, {
      toValue: TAB_CENTER - idx * TAB_SPACING,
      tension: 60,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) * 1.5 && Math.abs(g.dx) > 10,
      onPanResponderRelease: (_, g) => {
        const cur = activeTabIdxRef.current;
        if (g.dx < -SWIPE_THRESHOLD) {
          switchTab(cur + 1);
        } else if (g.dx > SWIPE_THRESHOLD) {
          if (cur === 0) setSideMenuVisibleRef.current(true);
          else switchTab(cur - 1);
        }
      },
    })
  ).current;

  const handleInputFocus = () => {
    setInputFocused(true);
    Animated.timing(scrimOpacity, {
      toValue: 0.35,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const handleInputBlur = () => {
    setInputFocused(false);
    Animated.timing(scrimOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    Keyboard.dismiss();
    onNewChat(text);
  };

  const renderContent = () => {
    switch (TABS[activeTabIdx]) {
      case "home":
        return (
          <FlatList
            data={builtApps}
            numColumns={NUM_COLUMNS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridRow}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  まだビルド済みのアプリがありません{"\n"}
                  下の入力欄からアプリを作ってみましょう！
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.iconCell}
                onPress={() => onOpenApp(item)}
              >
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
      case "store":
        return (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>ストアは近日公開予定です</Text>
          </View>
        );
      case "history":
        return (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>チャット履歴は近日公開予定です</Text>
          </View>
        );
      case "drafts":
        return (
          <FlatList
            data={draftApps}
            numColumns={NUM_COLUMNS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridRow}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>ドラフトはありません</Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.iconCell}
                onPress={() => onOpenApp(item)}
              >
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
    }
  };

  const hasText = !!inputText.trim();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerBtn}
          onPress={() => setSideMenuVisible(true)}
        >
          <Menu size={24} color="#141414" strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Matry</Text>
        <Pressable style={styles.headerBtn}>
          <Bell size={24} color="#141414" strokeWidth={2} />
        </Pressable>
      </View>

      {/* Scrollable content with swipe-to-switch-tab gesture */}
      <View style={styles.content} {...panResponder.panHandlers}>
        {renderContent()}
      </View>

      {/* Scrim when input is focused */}
      <Animated.View
        style={[styles.scrim, { opacity: scrimOpacity }]}
        pointerEvents={inputFocused ? "auto" : "none"}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => inputRef.current?.blur()}
        />
      </Animated.View>

      {/* Chat input bar */}
      <View style={styles.chatBar}>
        <TextInput
          ref={inputRef}
          style={[styles.chatInput, inputFocused && styles.chatInputFocused]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="どんなアプリを作りますか？"
          placeholderTextColor="#aaa"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.sendButton, hasText && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!hasText}
        >
          <ArrowUp size={20} color="#fff" strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Bottom tab bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        {/* Carousel icons */}
        <View style={styles.tabIconArea} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.tabIconContainer,
              { transform: [{ translateX: tabContainerX }] },
            ]}
          >
            {TABS.map((tab, i) => {
              const Icon = TAB_ICONS[i];
              const isActive = activeTabIdx === i;
              const dist = Math.abs(i - activeTabIdx);
              const opacity = dist === 0 ? 1 : dist === 1 ? 0.5 : 0.2;
              return (
                <Pressable
                  key={tab}
                  onPress={() => switchTab(i)}
                  style={[styles.tabIconBtn, { left: i * TAB_SPACING }]}
                  hitSlop={12}
                >
                  <View style={{ opacity }}>
                    <Icon
                      size={TAB_ICON_SIZE}
                      color={isActive ? "#007AFF" : "#ABABAB"}
                      strokeWidth={2}
                    />
                  </View>
                </Pressable>
              );
            })}
          </Animated.View>
        </View>

        {/* Active tab label (always centered) */}
        <Text style={styles.tabActiveLabel}>{TAB_LABELS[activeTabIdx]}</Text>
        <View style={styles.tabActiveDot} />
      </View>

      <SideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        onChatHistory={() => setSideMenuVisible(false)}
        onSettings={() => setSideMenuVisible(false)}
        email={email}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerBtn: { padding: 6 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#007AFF",
    letterSpacing: 0.2,
  },

  // Content
  content: { flex: 1 },
  gridContent: { padding: 16, paddingBottom: 8 },
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

  // Scrim
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },

  // Chat bar
  chatBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#141414",
    backgroundColor: "#fff",
  },
  chatInputFocused: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#007AFF",
  },

  // Tab bar (height is TAB_BAR_HEIGHT + dynamic insets.bottom via inline style)
  tabBar: {
    minHeight: TAB_BAR_HEIGHT,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
    overflow: "hidden",
  },
  tabIconArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
  },
  tabIconContainer: {
    position: "absolute",
    top: (TAB_BAR_HEIGHT - TAB_ICON_SIZE) / 2 - 8,
    width: TABS.length * TAB_SPACING,
    height: TAB_ICON_SIZE,
  },
  tabIconBtn: {
    position: "absolute",
    width: TAB_ICON_SIZE,
    height: TAB_ICON_SIZE,
  },
  tabActiveLabel: {
    position: "absolute",
    bottom: 6,
    fontSize: 10,
    color: "#007AFF",
    fontWeight: "600",
  },
  tabActiveDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#007AFF",
  },
});
