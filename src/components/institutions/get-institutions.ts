import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type InstitutionListItem = Pick<
  Database["public"]["Tables"]["institutions"]["Row"],
  "id" | "name" | "city" | "coordinator" | "phone"
>;

export async function getInstitutions(): Promise<InstitutionListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("institutions")
    .select("id, name, city, coordinator, phone")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
