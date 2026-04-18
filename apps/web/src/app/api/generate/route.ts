import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase/client";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `あなたはスマホアプリのUIをReactで生成するAIです。
生成したコードはWebView + Babel standaloneのサンドボックスで動作します。

以下のルールを必ず守ること：
- コンポーネント名は必ず "App" にする
- importは一切書かない（React・ReactDOMはグローバルで利用可能）
- export defaultは書かない
- スタイルはインラインstyleオブジェクトを使う（例: style={{ color: 'red' }}）
- 使えるのはHTML要素（div, button, input, span, p, h1〜h6など）のみ
- コードブロック（\`\`\`）は使わず、コードのみを返す

出力例：
function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
      <h1 style={{ fontSize: 32 }}>{count}</h1>
      <button onClick={() => setCount(c => c + 1)} style={{ padding: '8px 24px', fontSize: 18 }}>
        +1
      </button>
    </div>
  );
}`;

const MAX_RETRIES = 3;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

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
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
