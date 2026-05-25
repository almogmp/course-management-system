import "server-only";

import type { createServerSupabaseClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export async function resolveCoordinatorForInstitution(
  supabase: SupabaseClient,
  institutionId: string,
): Promise<{ ok: true; id: string; fullName: string } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from("institution_coordinators")
    .select("id, full_name")
    .eq("institution_id", institutionId)
    .eq("is_active", true)
    .order("full_name")
    .limit(1)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    return {
      ok: false,
      error: "למוסד שנבחר אין רכז פעיל. הוסיפו רכז למוסד לפני יצירת קורס.",
    };
  }

  return { ok: true, id: data.id, fullName: data.full_name };
}
