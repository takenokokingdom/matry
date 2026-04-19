import { useRef, useState } from "react";
import { ActivityIndicator, Animated, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./src/features/apps/HomeScreen";
import type { SavedApp } from "./src/features/apps/api/fetch-apps";
import AuthScreen from "./src/features/auth/AuthScreen";
import { useAuth } from "./src/features/auth/hooks/useAuth";
import ChatScreen from "./src/features/chat/ChatScreen";
import PreviewScreen from "./src/features/preview/PreviewScreen";

type Screen =
  | { name: "home" }
  | { name: "chat"; initialText?: string }
  | { name: "preview"; app: SavedApp };

function RootNavigator() {
  const { session, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const navigateTo = (next: Screen) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      setScreen(next);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!session) return <AuthScreen />;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {screen.name === "chat" && (
        <ChatScreen
          initialText={screen.initialText}
          onBack={() => navigateTo({ name: "home" })}
        />
      )}

      {screen.name === "preview" && (
        <PreviewScreen
          code={screen.app.code}
          onClose={() => navigateTo({ name: "home" })}
        />
      )}

      {screen.name === "home" && (
        <HomeScreen
          onNewChat={(text) => navigateTo({ name: "chat", initialText: text })}
          onOpenApp={(app) => navigateTo({ name: "preview", app })}
          email={session?.user.email}
        />
      )}
    </Animated.View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
