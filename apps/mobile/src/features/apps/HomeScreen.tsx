import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../shared/lib/supabase/client";
import { type SavedApp, fetchApps } from "./api/fetch-apps";

type Props = {
  onNewApp: () => void;
  onOpenApp: (app: SavedApp) => void;
};

export default function HomeScreen({ onNewApp, onOpenApp }: Props) {
  const [apps, setApps] = useState<SavedApp[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setApps(await fetchApps());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matry</Text>
        <Pressable
          style={styles.logoutButton}
          onPress={() => supabase.auth.signOut()}
        >
          <Text style={styles.logoutButtonText}>ログアウト</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#007AFF" />
      ) : (
        <FlatList
          data={apps}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                まだアプリがありません{"\n"}下のボタンから作ってみましょう！
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => onOpenApp(item)}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>
                  {item.title.slice(0, 1)}
                </Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardDate}>
                  {new Date(item.created_at).toLocaleDateString("ja-JP")}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <Pressable style={styles.fab} onPress={onNewApp}>
        <Text style={styles.fabText}>＋ 新しいアプリを作る</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  logoutButton: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logoutButtonText: { color: "#666", fontSize: 13 },
  loader: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 100 },
  empty: { flex: 1, alignItems: "center", paddingTop: 80 },
  emptyText: {
    color: "#999",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "600" },
  cardDate: { fontSize: 12, color: "#999", marginTop: 2 },
  fab: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  fabText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
