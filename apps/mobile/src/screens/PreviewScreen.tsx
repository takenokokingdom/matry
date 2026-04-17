import { Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  code: string;
  onClose: () => void;
};

function buildHtml(code: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, sans-serif; }
    #error { color: red; padding: 16px; white-space: pre-wrap; font-size: 13px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error"></div>
  <script type="text/babel">
    try {
      ${code}
      ReactDOM.render(<App />, document.getElementById('root'));
    } catch (e) {
      document.getElementById('error').textContent = e.message;
    }
  </script>
</body>
</html>`;
}

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
        source={{ html: buildHtml(code) }}
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
