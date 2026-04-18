import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  content: string;
};

export default function CodeGeneratingIndicator({ content }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  const codeStart = content.indexOf("function App");
  const code = codeStart >= 0 ? content.slice(codeStart) : content;
  const lastLine =
    code
      .split("\n")
      .filter((l) => l.trim())
      .at(-1) ?? "";

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.skeletonLine, { opacity: pulse }]} />
      <Animated.View
        style={[styles.skeletonLine, { width: "55%", opacity: pulse }]}
      />
      <View style={styles.divider} />
      <View style={styles.lastLineRow}>
        <Text style={styles.lastLineText} numberOfLines={1}>
          {lastLine || "生成中..."}
        </Text>
        <Text style={styles.cursor}>▍</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  skeletonLine: {
    height: 8,
    width: "75%",
    backgroundColor: "#3a3a3a",
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
  },
  lastLineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  lastLineText: {
    flex: 1,
    color: "#a8d8a8",
    fontFamily: "monospace",
    fontSize: 12,
  },
  cursor: { color: "#a8d8a8", fontSize: 12 },
});
