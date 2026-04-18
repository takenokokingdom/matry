import { supabase } from "../../../shared/lib/supabase/client";

export async function saveApp(title: string, code: string): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("apps")
    .insert({ user_id: user.id, title, code })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}
