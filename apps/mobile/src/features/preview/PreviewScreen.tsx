import { Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { buildPreviewHtml } from "../../shared/lib/html/build-preview";

type Props = {
  code: string;
  onClose: () => void;
};

export default function PreviewScreen({ code, onClose }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>プレビュー</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕ 閉じる</Text>
        </Pressable>
      </View>
      <WebView
        source={{ html: buildPreviewHtml(code) }}
        style={styles.webview}
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  title: { fontSize: 16, fontWeight: "bold" },
  closeButton: { padding: 4 },
  closeText: { color: "#007AFF", fontSize: 15 },
  webview: { flex: 1 },
});
