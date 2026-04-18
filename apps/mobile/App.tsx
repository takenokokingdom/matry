import { SafeAreaProvider } from "react-native-safe-area-context";
import ChatScreen from "./src/features/chat/ChatScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <ChatScreen />
    </SafeAreaProvider>
  );
}
