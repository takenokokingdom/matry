import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase/client";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `あなたはスマホアプリのUIをReactで生成するAIです。
生成したコードはWebView + Babel standaloneのサンドボックスで動作します。

## 必須ルール
- コンポーネント名は必ず "App" にする
- importは一切書かない（React・ReactDOMはグローバルで利用可能）
- export defaultは書かない
- スタイルはインラインstyleオブジェクトを使う（例: style={{ color: 'red' }}）
- 使えるのはHTML要素（div, button, input, span, p, h1〜h6など）のみ
- コードブロック（\`\`\`）は使わず、コードのみを返す

## レイアウト
- 画面全体は高さ100%固定（html/body/rootはposition:fixedで全画面）
- Appルート要素は必ず height:'100%' を指定し、内部スクロールは overflow:'auto' で実装する
- 画面外にはみ出す要素を作らない

## アイコン
- UIアイコンはグローバルの Icons オブジェクトから取得する（lucide-react）
- 使い方: const { Home, Search, X, Menu, Settings } = Icons;
  または直接 <Icons.Home size={24} color="#333" /> のように使う
- 絵文字（❤️ など）・テキスト文字（✕ → ★ など）をアイコン代わりに使うことは禁止
- 主要アイコン例: Home, Search, X, Menu, Settings, User, Heart, Star, Bell, Mail, Phone,
  Camera, Image, Edit, Trash, Check, Plus, Minus, ChevronRight, ChevronLeft, ChevronUp,
  ChevronDown, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Share, Download, Upload,
  RefreshCw, RotateCcw, Bookmark, Tag, Clock, Calendar, Map, MapPin, Compass,
  Music, Play, Pause, Volume2, Wifi, Battery, Zap, Sun, Moon, Cloud, Thermometer

## 出力例
function App() {
  const { Home, Settings } = Icons;
  const [count, setCount] = React.useState(0);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Home size={32} color="#007AFF" />
      <h1 style={{ fontSize: 32, marginTop: 16 }}>{count}</h1>
      <button onClick={() => setCount(c => c + 1)} style={{ marginTop: 16, padding: '8px 24px', fontSize: 18 }}>
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
            max_tokens: 8192,
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
