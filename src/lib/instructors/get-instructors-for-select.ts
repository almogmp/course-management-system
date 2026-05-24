import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseServerClient } from "@/lib/supabase/server";

export type InstructorSelectOption = {
  id: string;
  full_name: string;
};

export async function getInstructorsForSelect(): Promise<InstructorSelectOption[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("instructors")
    .select("id, full_name")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    full_name: row.full_name,
  }));
}

export async function instructorExists(
  supabase: SupabaseServerClient,
  instructorId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("instructors")
    .select("id")
    .eq("id", instructorId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}
