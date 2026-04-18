export const isGeneratedCode = (text: string) => text.includes("function App");

export function extractCode(text: string): string {
  const start = text.indexOf("function App");
  if (start === -1) return text;

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

  return text.slice(start, end + 1);
}
