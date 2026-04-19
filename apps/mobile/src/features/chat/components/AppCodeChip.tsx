import { Code2, Play } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title?: string;
  onOpen: () => void;
};

export default function AppCodeChip({ title = "生成アプリ", onOpen }: Props) {
  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <View style={styles.iconBox}>
        <Code2 size={18} color="#fff" strokeWidth={2} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle}>React · タップして開く</Text>
      </View>
      <View style={styles.playBtn}>
        <Play size={14} color="#007AFF" strokeWidth={2} fill="#007AFF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#141414",
  },
  subtitle: {
    fontSize: 12,
    color: "#888",
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
});
