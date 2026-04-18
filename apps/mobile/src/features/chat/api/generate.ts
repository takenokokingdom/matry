import { supabase } from "../../../shared/lib/supabase/client";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export type HistoryItem = { role: "user" | "assistant"; content: string };

type GenerateCallbacks = {
  onProgress: (text: string) => void;
  onDone: (text: string) => void;
  onError: () => void;
};

export async function generateApp(
  message: string,
  history: HistoryItem[],
  { onProgress, onDone, onError }: GenerateCallbacks,
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) {
    onError();
    return;
  }

  const xhr = new XMLHttpRequest();
  let accumulated = "";

  xhr.open("POST", `${API_URL}/api/generate`);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", `Bearer ${token}`);

  xhr.onprogress = () => {
    accumulated = xhr.responseText;
    onProgress(accumulated);
  };

  xhr.onload = () => {
    onDone(accumulated);
  };

  xhr.onerror = () => {
    onError();
  };

  xhr.send(JSON.stringify({ message, history }));
}
