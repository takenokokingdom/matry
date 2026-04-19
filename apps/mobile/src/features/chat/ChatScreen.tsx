import { useEffect, useRef, useState } from "react";
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
import { extractCode, isGeneratedCode } from "../../shared/lib/code/detect";
import { supabase } from "../../shared/lib/supabase/client";
import { saveApp } from "../apps/api/save-app";
import BuildSheet from "../apps/components/BuildSheet";
import PreviewScreen from "../preview/PreviewScreen";
import { type HistoryItem, generateApp } from "./api/generate";
import MarkdownMessage from "./components/MarkdownMessage";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  rawContent?: string;
  streaming?: boolean;
};

type Props = {
  onBack?: () => void;
  initialText?: string;
};

export default function ChatScreen({ onBack, initialText }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialText ?? "");
  const [loading, setLoading] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [savedAppId, setSavedAppId] = useState<string | null>(null);
  const [buildSheetVisible, setBuildSheetVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run only on mount
  useEffect(() => {
    if (initialText?.trim()) {
      sendMessageText(initialText.trim());
    }
  }, []);

  const buildHistory = (msgs: Message[]): HistoryItem[] =>
    msgs
      .filter((m) => !m.streaming)
      .map((m) => ({ role: m.role, content: m.rawContent ?? m.content }));

  const sendMessageText = (text: string) => {
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
            const code = extractCode(accumulated);
            const title =
              next.find((m) => m.role === "user")?.content.slice(0, 30) ??
              "無題のアプリ";
            saveApp(title, code)
              .then((id) => setSavedAppId(id))
              .catch(() => {});
            setMessages((cur) =>
              cur.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: "アプリを生成しました！",
                      rawContent: code,
                      streaming: false,
                    }
                  : m,
              ),
            );
            setPreviewCode(code);
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

  const sendMessage = () => {
    const text = input.trim();
    if (!text || loading) return;
    sendMessageText(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← ホーム</Text>
          </Pressable>
        ) : (
          <Text style={styles.headerTitle}>Matry</Text>
        )}
        <View style={styles.headerRight}>
          {savedAppId && !loading && (
            <Pressable
              style={styles.buildButton}
              onPress={() => setBuildSheetVisible(true)}
            >
              <Text style={styles.buildButtonText}>ビルドする</Text>
            </Pressable>
          )}
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
          extraData={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.userBubble : styles.aiBubble,
                item.streaming &&
                  isGeneratedCode(item.content) &&
                  styles.codeBubble,
              ]}
            >
              {item.role === "user" ? (
                <Text style={styles.userText}>{item.content}</Text>
              ) : (
                <MarkdownMessage
                  content={item.content}
                  streaming={item.streaming}
                />
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
            onNewChat={() => setPreviewCode(null)}
          />
        )}
      </Modal>

      {savedAppId && (
        <BuildSheet
          visible={buildSheetVisible}
          appId={savedAppId}
          onBuilt={(name) => {
            setBuildSheetVisible(false);
            setSavedAppId(null);
          }}
          onClose={() => setBuildSheetVisible(false)}
        />
      )}
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
  backButton: { paddingVertical: 4 },
  backButtonText: { fontSize: 15, color: "#007AFF" },
  headerRight: { flexDirection: "row", gap: 8, alignItems: "center" },
  buildButton: {
    backgroundColor: "#34C759",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  buildButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
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
  codeBubble: {
    alignSelf: "stretch",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  userText: { color: "#fff", fontSize: 15 },
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
