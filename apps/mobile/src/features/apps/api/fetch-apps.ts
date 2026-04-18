import { supabase } from "../../../shared/lib/supabase/client";

export type AppStatus = "draft" | "built";

export type SavedApp = {
  id: string;
  title: string;
  name: string | null;
  code: string;
  icon_name: string | null;
  icon_image_url: string | null;
  status: AppStatus;
  created_at: string;
};

export async function fetchBuiltApps(): Promise<SavedApp[]> {
  const { data, error } = await supabase
    .from("apps")
    .select(
      "id, title, name, code, icon_name, icon_image_url, status, created_at",
    )
    .eq("status", "built")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchDraftApps(): Promise<SavedApp[]> {
  const { data, error } = await supabase
    .from("apps")
    .select(
      "id, title, name, code, icon_name, icon_image_url, status, created_at",
    )
    .eq("status", "draft")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
