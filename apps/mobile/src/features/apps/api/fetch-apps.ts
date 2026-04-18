import { supabase } from "../../../shared/lib/supabase/client";

export type SavedApp = {
  id: string;
  title: string;
  code: string;
  created_at: string;
};

export async function fetchApps(): Promise<SavedApp[]> {
  const { data, error } = await supabase
    .from("apps")
    .select("id, title, code, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
