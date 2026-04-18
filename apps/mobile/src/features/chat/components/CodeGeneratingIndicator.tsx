import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  content: string;
};

export default function CodeGeneratingIndicator({ content }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmer]);

  const codeStart = content.indexOf("function App");
  const code = codeStart >= 0 ? content.slice(codeStart) : content;
  const lastLine =
    code
      .split("\n")
      .filter((l) => l.trim())
      .at(-1) ?? "";

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, 0.18],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: shimmerOpacity, backgroundColor: "#fff", borderRadius: 8 },
        ]}
      />
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: "55%" }]} />
      <View style={styles.divider} />
      <View style={styles.lastLineRow}>
        <Text style={styles.lastLineText} numberOfLines={1}>
          {lastLine}
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
    overflow: "hidden",
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
    marginVertical: 2,
  },
  lastLineRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastLineText: {
    flex: 1,
    color: "#a8d8a8",
    fontFamily: "monospace",
    fontSize: 12,
  },
  cursor: { color: "#a8d8a8", fontSize: 12 },
});
