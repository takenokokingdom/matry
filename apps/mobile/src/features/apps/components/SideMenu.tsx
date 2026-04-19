import { Settings, User } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Settings, User } from "lucide-react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onChatHistory: () => void;
  onSettings: () => void;
  email?: string;
};

const MENU_WIDTH = Dimensions.get("window").width * 0.72;

export default function SideMenu({
  visible,
  onClose,
  onChatHistory,
  onSettings,
  email,
}: Props) {
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.menu,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={styles.menuContent}>
          <Text style={styles.menuHeader}>Matry</Text>

          <Pressable style={styles.menuItem} onPress={onChatHistory}>
            <Text style={styles.menuItemText}>チャット履歴</Text>
          </Pressable>
        </View>

        {/* Account row: avatar + email + settings */}
        <View style={styles.menuBottom}>
          <View style={styles.divider} />
          <View style={styles.accountRow}>
            <View style={styles.avatar}>
              <User size={16} color="#ABABAB" strokeWidth={2} />
            </View>
            <Text style={styles.emailText} numberOfLines={1}>
              {email ?? ""}
            </Text>
            <Pressable onPress={onSettings} hitSlop={8}>
              <Settings size={20} color="#ABABAB" strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: MENU_WIDTH,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  menuContent: { flex: 1, paddingTop: 16 },
  menuHeader: {
    fontSize: 20,
    fontWeight: "800",
    paddingHorizontal: 20,
    paddingBottom: 20,
    color: "#007AFF",
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemText: { fontSize: 16, color: "#1a1a1a" },
  menuBottom: { paddingBottom: 8 },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  emailText: {
    flex: 1,
    fontSize: 13,
    color: "#ABABAB",
  },
});
