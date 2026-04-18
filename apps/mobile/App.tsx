import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./src/features/apps/HomeScreen";
import type { SavedApp } from "./src/features/apps/api/fetch-apps";
import AuthScreen from "./src/features/auth/AuthScreen";
import { useAuth } from "./src/features/auth/hooks/useAuth";
import ChatScreen from "./src/features/chat/ChatScreen";
import PreviewScreen from "./src/features/preview/PreviewScreen";

type Screen =
  | { name: "home" }
  | { name: "chat" }
  | { name: "preview"; app: SavedApp };

function RootNavigator() {
  const { session, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>({ name: "home" });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!session) return <AuthScreen />;

  if (screen.name === "chat") {
    return <ChatScreen onBack={() => setScreen({ name: "home" })} />;
  }

  if (screen.name === "preview") {
    return (
      <PreviewScreen
        code={screen.app.code}
        onClose={() => setScreen({ name: "home" })}
      />
    );
  }

  return (
    <HomeScreen
      onNewApp={() => setScreen({ name: "chat" })}
      onOpenApp={(app) => setScreen({ name: "preview", app })}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
