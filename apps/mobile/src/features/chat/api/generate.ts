const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type GenerateCallbacks = {
  onProgress: (text: string) => void;
  onDone: (text: string) => void;
  onError: () => void;
};

export function generateApp(
  message: string,
  { onProgress, onDone, onError }: GenerateCallbacks,
): void {
  const xhr = new XMLHttpRequest();
  let accumulated = "";

  xhr.open("POST", `${API_URL}/api/generate`);
  xhr.setRequestHeader("Content-Type", "application/json");

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

  xhr.send(JSON.stringify({ message }));
}
