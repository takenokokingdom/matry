import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ICON_LABELS,
  ICON_NAMES,
  type IconName,
} from "../../../shared/lib/icons/registry";
import { buildApp, pickImage } from "../api/build-app";
import AppIcon from "./AppIcon";

type Props = {
  visible: boolean;
  appId: string;
  onBuilt: (name: string) => void;
  onClose: () => void;
};

const ICON_CELL_SIZE = (Dimensions.get("window").width - 32 - 8 * 4) / 5;

export default function BuildSheet({
  visible,
  appId,
  onBuilt,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconName | null>(null);
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setCustomImageUri(uri);
      setSelectedIcon(null);
    }
  };

  const handleBuild = async () => {
    if (!name.trim()) {
      setError("アプリ名を入力してください");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await buildApp({
        appId,
        name: name.trim(),
        iconName: selectedIcon,
        iconImageUri: customImageUri,
      });
      onBuilt(name.trim());
    } catch {
      setError("ビルドに失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const iconPreview = customImageUri ? (
    <Image source={{ uri: customImageUri }} style={styles.previewImage} />
  ) : selectedIcon ? (
    <AppIcon iconName={selectedIcon} size={64} />
  ) : (
    <View style={styles.previewPlaceholder}>
      <Text style={styles.previewPlaceholderText}>?</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>アプリをビルドする</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.previewRow}>
              {iconPreview}
              <View style={styles.nameInputWrapper}>
                <Text style={styles.label}>アプリ名</Text>
                <TextInput
                  style={styles.nameInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="アプリ名を入力"
                  placeholderTextColor="#aaa"
                  maxLength={30}
                  autoFocus
                />
              </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.label}>アイコン</Text>
            <FlatList
              data={[...ICON_NAMES]}
              numColumns={5}
              scrollEnabled={false}
              keyExtractor={(item) => item}
              columnWrapperStyle={styles.iconRow}
              renderItem={({ item }) => {
                const isSelected = selectedIcon === item && !customImageUri;
                return (
                  <Pressable
                    style={[
                      styles.iconCell,
                      isSelected && styles.iconCellSelected,
                    ]}
                    onPress={() => {
                      setSelectedIcon(item);
                      setCustomImageUri(null);
                    }}
                  >
                    <AppIcon iconName={item} size={36} />
                    <Text style={styles.iconLabel} numberOfLines={1}>
                      {ICON_LABELS[item]}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <Pressable style={styles.imagePicker} onPress={handlePickImage}>
              {customImageUri ? (
                <Image
                  source={{ uri: customImageUri }}
                  style={styles.pickedImage}
                />
              ) : null}
              <Text style={styles.imagePickerText}>
                {customImageUri ? "画像を変更" : "カメラロールから選ぶ"}
              </Text>
            </Pressable>
          </ScrollView>

          <Pressable
            style={[styles.buildButton, loading && styles.buildButtonDisabled]}
            onPress={handleBuild}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buildButtonText}>ビルド</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  previewPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  previewPlaceholderText: {
    fontSize: 28,
    color: "#aaa",
    fontWeight: "bold",
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  nameInputWrapper: { flex: 1 },
  label: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginBottom: 12,
  },
  iconRow: { gap: 8, marginBottom: 8 },
  iconCell: {
    width: ICON_CELL_SIZE,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 4,
  },
  iconCellSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#EAF3FF",
  },
  iconLabel: {
    fontSize: 10,
    color: "#555",
    textAlign: "center",
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  pickedImage: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  imagePickerText: {
    fontSize: 14,
    color: "#007AFF",
  },
  buildButton: {
    backgroundColor: "#007AFF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buildButtonDisabled: { backgroundColor: "#aaa" },
  buildButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
