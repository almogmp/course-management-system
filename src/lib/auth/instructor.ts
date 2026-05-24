import { createServerSupabaseClient } from "@/lib/supabase/server";

/** מזהה מדריך של המשתמש המחובר */
export async function getCurrentInstructorId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.id;
}
