import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matry</Text>
      <Text style={styles.sub}>API: {API_URL}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  sub: {
    marginTop: 8,
    fontSize: 12,
    color: "#888",
  },
});
