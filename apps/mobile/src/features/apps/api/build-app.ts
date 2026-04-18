import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../shared/lib/supabase/client";

export type BuildParams = {
  appId: string;
  name: string;
  iconName?: string | null;
  iconImageUri?: string | null;
};

export async function buildApp({
  appId,
  name,
  iconName,
  iconImageUri,
}: BuildParams): Promise<void> {
  let iconImageUrl: string | null = null;

  if (iconImageUri) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const ext = iconImageUri.split(".").pop() ?? "jpg";
    const path = `${user.id}/${appId}.${ext}`;

    const response = await fetch(iconImageUri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from("app-icons")
      .upload(path, blob, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("app-icons")
      .getPublicUrl(path);
    iconImageUrl = urlData.publicUrl;
  }

  const { error } = await supabase
    .from("apps")
    .update({
      name,
      icon_name: iconName ?? null,
      icon_image_url: iconImageUrl,
      status: "built",
    })
    .eq("id", appId);

  if (error) throw error;
}

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}
