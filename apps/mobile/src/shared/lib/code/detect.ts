export const isGeneratedCode = (text: string) => {
  const idx = text.indexOf("function App");
  if (idx === -1) return false;
  // 関数本体 { が存在するときだけアプリコードとみなす
  return text.indexOf("{", idx) !== -1;
};

/** レスポンスから会話テキストとアプリコードを分離する */
export function splitResponse(text: string): {
  conversationText: string;
  code: string | null;
} {
  if (!isGeneratedCode(text)) return { conversationText: text, code: null };

  const code = extractCode(text);
  const codeStart = text.indexOf("function App");

  // コードフェンス（```jsx など）の開始位置を探す
  const beforeCode = text.slice(0, codeStart);
  const fenceMatch = beforeCode.match(/```[a-z]*\n?$/);
  const blockStart = fenceMatch
    ? beforeCode.lastIndexOf(fenceMatch[0])
    : codeStart;

  // コードフェンスの終了位置を探す
  const codeEnd = codeStart + code.length;
  const afterCode = text.slice(codeEnd);
  const closingMatch = afterCode.match(/^\s*\n?```/);
  const blockEnd = closingMatch ? codeEnd + closingMatch[0].length : codeEnd;

  const parts = [
    text.slice(0, blockStart).trim(),
    text.slice(blockEnd).trim(),
  ].filter(Boolean);

  return { conversationText: parts.join("\n\n"), code };
}

export function extractCode(text: string): string {
  const start = text.indexOf("function App");
  if (start === -1) return text;

  // 関数本体 { がなければ抽出不能
  if (text.indexOf("{", start) === -1) return text;

  let depth = 0;
  let inString: string | null = null;
  let end = start;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    const prev = i > 0 ? text[i - 1] : "";

    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  // 閉じ括弧が見つからなかった（途中で切れた）場合は start 以降を全部返す
  if (end === start) return text.slice(start);

  return text.slice(start, end + 1);
}
