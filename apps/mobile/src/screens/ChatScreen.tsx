import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PreviewScreen from "./PreviewScreen";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

const isGeneratedCode = (text: string) => text.includes("function App");

function GeneratingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotStyle = (dot: Animated.Value) => ({
    opacity: dot,
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <View style={styles.generatingRow}>
      <Text style={styles.generatingLabel}>生成中</Text>
      {(
        [
          ["d1", dot1],
          ["d2", dot2],
          ["d3", dot3],
        ] as const
      ).map(([key, dot]) => (
        <Animated.Text key={key} style={[styles.dot, dotStyle(dot)]}>
          ●
        </Animated.Text>
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setGeneratingId(assistantId);
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", streaming: true },
    ]);

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      let accumulated = "";

      xhr.open("POST", `${process.env.EXPO_PUBLIC_API_URL}/api/generate`);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onprogress = () => {
        accumulated = xhr.responseText;
        if (!isGeneratedCode(accumulated)) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m,
            ),
          );
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      };

      xhr.onload = () => {
        setGeneratingId(null);
        if (isGeneratedCode(accumulated)) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "アプリを生成しました！", streaming: false }
                : m,
            ),
          );
          setPreviewCode(accumulated);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, streaming: false } : m,
            ),
          );
        }
        setLoading(false);
        resolve();
      };

      xhr.onerror = () => {
        setGeneratingId(null);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "エラーが発生しました。", streaming: false }
              : m,
          ),
        );
        setLoading(false);
        resolve();
      };

      xhr.send(JSON.stringify({ message: text }));
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matry</Text>
        {previewCode && !loading && (
          <Pressable
            style={styles.previewButton}
            onPress={() => setPreviewCode(previewCode)}
          >
            <Text style={styles.previewButtonText}>▶ プレビュー</Text>
          </Pressable>
        )}
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {item.streaming && item.id === generatingId ? (
                <GeneratingIndicator />
              ) : (
                <Text
                  style={item.role === "user" ? styles.userText : styles.aiText}
                >
                  {item.content}
                  {item.streaming ? "▍" : ""}
                </Text>
              )}
            </View>
          )}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="どんなアプリを作りますか？"
            placeholderTextColor="#999"
            multiline
            editable={!loading}
            onSubmitEditing={sendMessage}
          />
          <Pressable
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>送信</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={!!previewCode} animationType="slide">
        {previewCode && (
          <PreviewScreen
            code={previewCode}
            onClose={() => setPreviewCode(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  previewButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  previewButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  messageList: { padding: 16, gap: 12 },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#007AFF" },
  aiBubble: { alignSelf: "flex-start", backgroundColor: "#F0F0F0" },
  userText: { color: "#fff", fontSize: 15 },
  aiText: { color: "#000", fontSize: 15 },
  generatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  generatingLabel: { fontSize: 14, color: "#555" },
  dot: { fontSize: 8, color: "#555" },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendButtonDisabled: { backgroundColor: "#aaa" },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
});
