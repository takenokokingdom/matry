import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `あなたはReact Nativeアプリを生成するAIです。
ユーザーの指示に従い、React NativeのJSXコードを生成してください。

以下のルールを守ること：
- コンポーネント名は必ず "App" にする
- import文は react と react-native のみ使用可能
- export default でコンポーネントをエクスポートする
- スタイルはStyleSheetを使う
- コードブロック（\`\`\`）は使わず、コードのみを返す`;

const MAX_RETRIES = 3;

export async function POST(req: NextRequest) {
  const { message, history = [] } = await req.json();

  const messages: Anthropic.MessageParam[] = [
    ...history,
    { role: "user", content: message },
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const response = await anthropic.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            messages,
          });

          for await (const chunk of response) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }

          controller.close();
          return;
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e));
          if (attempt < MAX_RETRIES - 1) continue;
        }
      }

      controller.enqueue(
        encoder.encode(`エラーが発生しました: ${lastError?.message}`),
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
