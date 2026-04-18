import { StyleSheet, Text } from "react-native";
import Markdown from "react-native-markdown-display";

type Props = {
  content: string;
  streaming?: boolean;
};

export default function MarkdownMessage({ content, streaming }: Props) {
  if (streaming) {
    return (
      <Text style={styles.streamingText}>
        {content}
        {"▍"}
      </Text>
    );
  }

  return <Markdown style={markdownStyles}>{content}</Markdown>;
}

const styles = StyleSheet.create({
  streamingText: { color: "#000", fontSize: 15 },
});

const markdownStyles = StyleSheet.create({
  body: { color: "#000", fontSize: 15 },
  heading1: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  heading2: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  heading3: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  strong: { fontWeight: "bold" },
  em: { fontStyle: "italic" },
  code_inline: {
    fontFamily: "monospace",
    backgroundColor: "#e8e8e8",
    borderRadius: 3,
    paddingHorizontal: 4,
    fontSize: 13,
  },
  fence: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  code_block: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    color: "#d4d4d4",
    fontFamily: "monospace",
    fontSize: 13,
  },
  bullet_list: { marginVertical: 4 },
  ordered_list: { marginVertical: 4 },
  list_item: { marginBottom: 2 },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#ccc",
    paddingLeft: 12,
    marginVertical: 4,
    color: "#555",
  },
  paragraph: { marginBottom: 4 },
  link: { color: "#007AFF" },
});
