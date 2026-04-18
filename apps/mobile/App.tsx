import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthScreen from "./src/features/auth/AuthScreen";
import { useAuth } from "./src/features/auth/hooks/useAuth";
import ChatScreen from "./src/features/chat/ChatScreen";

function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return session ? <ChatScreen /> : <AuthScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
