import { useRef, useState } from "react";
import {
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
import { isGeneratedCode } from "../../shared/lib/code/detect";
import { supabase } from "../../shared/lib/supabase/client";
import PreviewScreen from "../preview/PreviewScreen";
import { type HistoryItem, generateApp } from "./api/generate";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  rawContent?: string;
  streaming?: boolean;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const buildHistory = (msgs: Message[]): HistoryItem[] =>
    msgs
      .filter((m) => !m.streaming)
      .map((m) => ({ role: m.role, content: m.rawContent ?? m.content }));

  const sendMessage = () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => {
      const next = [...prev, userMessage];

      const assistantId = (Date.now() + 1).toString();
      const history = buildHistory(next);

      const withAssistant: Message[] = [
        ...next,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ];

      setLoading(true);
      setInput("");

      generateApp(text, history, {
        onProgress: (accumulated) => {
          setMessages((cur) =>
            cur.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m,
            ),
          );
          flatListRef.current?.scrollToEnd({ animated: true });
        },
        onDone: (accumulated) => {
          if (isGeneratedCode(accumulated)) {
            setMessages((cur) =>
              cur.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: "アプリを生成しました！",
                      rawContent: accumulated,
                      streaming: false,
                    }
                  : m,
              ),
            );
            setPreviewCode(accumulated);
          } else {
            setMessages((cur) =>
              cur.map((m) =>
                m.id === assistantId
                  ? { ...m, rawContent: accumulated, streaming: false }
                  : m,
              ),
            );
          }
          setLoading(false);
        },
        onError: () => {
          setMessages((cur) =>
            cur.map((m) =>
              m.id === assistantId
                ? { ...m, content: "エラーが発生しました。", streaming: false }
                : m,
            ),
          );
          setLoading(false);
        },
      });

      return withAssistant;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matry</Text>
        <View style={styles.headerRight}>
          {previewCode && !loading && (
            <Pressable
              style={styles.previewButton}
              onPress={() => setPreviewCode(previewCode)}
            >
              <Text style={styles.previewButtonText}>▶ プレビュー</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.logoutButton}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={styles.logoutButtonText}>ログアウト</Text>
          </Pressable>
        </View>
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
              <Text
                style={item.role === "user" ? styles.userText : styles.aiText}
              >
                {item.content}
                {item.streaming ? "▍" : ""}
              </Text>
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
  headerRight: { flexDirection: "row", gap: 8, alignItems: "center" },
  previewButton: {
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  previewButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  logoutButton: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logoutButtonText: { color: "#666", fontSize: 13 },
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
