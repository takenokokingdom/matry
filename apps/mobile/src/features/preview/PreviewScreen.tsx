import { ArrowUp, Eye, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { buildPreviewHtml } from "../../shared/lib/html/build-preview";

type Props = {
  code: string;
  onClose: () => void;
  onNewChat: (text: string) => void;
  appId?: string;
  title?: string;
};

export default function PreviewScreen({
  code,
  onClose,
  onNewChat,
  appId: _appId,
  title: _title,
}: Props) {
  const insets = useSafeAreaInsets();
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const kbAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const onShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        Animated.timing(kbAnim, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === "ios" ? e.duration : 250,
          useNativeDriver: false,
        }).start();
      },
    );
    const onHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        Animated.timing(kbAnim, {
          toValue: 0,
          duration: Platform.OS === "ios" ? e.duration : 250,
          useNativeDriver: false,
        }).start();
      },
    );
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [kbAnim]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    Keyboard.dismiss();
    onNewChat(text);
  };

  const hasText = !!inputText.trim();
  const eyeBottom = insets.bottom + 12;

  return (
    <View style={styles.container}>
      {/* Full-screen WebView */}
      <WebView
        source={{ html: buildPreviewHtml(code) }}
        style={StyleSheet.absoluteFill}
        originWhitelist={["*"]}
      />

      {/* Main overlay (hidden when overlayVisible=false) */}
      {overlayVisible && (
        <Animated.View
          style={[styles.overlay, { bottom: kbAnim }]}
          pointerEvents="box-none"
        >
          {/* Top row: × (left) + build button (right) */}
          <View
            style={[styles.topRow, { top: insets.top + 12 }]}
            pointerEvents="box-none"
          >
            <Pressable style={styles.iconBtn} onPress={onClose}>
              <X size={18} color="#fff" strokeWidth={2.5} />
            </Pressable>
            <Pressable style={styles.buildBtn}>
              <Text style={styles.buildBtnText}>アプリをビルドする</Text>
            </Pressable>
          </View>

          {/* Chat input row */}
          <View
            style={[styles.chatArea, { bottom: eyeBottom + 36 + 10 }]}
            pointerEvents="box-none"
          >
            <View style={styles.chatBar} pointerEvents="box-none">
              <TextInput
                ref={inputRef}
                style={styles.chatInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="どう変更しますか？"
                placeholderTextColor="#aaa"
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable
                style={[styles.sendBtn, hasText && styles.sendBtnActive]}
                onPress={handleSend}
                disabled={!hasText}
              >
                <ArrowUp
                  size={18}
                  color={hasText ? "#fff" : "#999"}
                  strokeWidth={2.5}
                />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Eye button — always visible at fixed position */}
      <Pressable
        style={[
          styles.iconBtn,
          styles.eyeBtn,
          { bottom: eyeBottom, opacity: overlayVisible ? 1 : 0.45 },
        ]}
        onPress={() => setOverlayVisible((v) => !v)}
      >
        <Eye size={18} color="#fff" strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  topRow: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  buildBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0,122,255,0.82)",
  },
  buildBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  chatArea: {
    position: "absolute",
    left: 16,
    right: 16,
  },

  eyeBtn: {
    position: "absolute",
    right: 16,
  },

  chatBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  chatInput: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#141414",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },

  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(200,200,200,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnActive: {
    backgroundColor: "#007AFF",
  },
});
