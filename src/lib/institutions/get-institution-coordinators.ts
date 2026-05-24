import { createServerSupabaseClient } from "@/lib/supabase/server";

export type InstitutionCoordinatorRow = {
  id: string;
  institution_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
};

export async function getInstitutionCoordinators(
  institutionId: string,
): Promise<InstitutionCoordinatorRow[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("institution_coordinators")
    .select("id, institution_id, full_name, phone, email, is_active")
    .eq("institution_id", institutionId)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as InstitutionCoordinatorRow[];
}

export async function getAllCoordinatorsForSelect(): Promise<
  Array<{
    id: string;
    institution_id: string;
    full_name: string;
    institution_name: string;
  }>
> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("institution_coordinators")
    .select("id, institution_id, full_name, institutions(name)")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<{
    id: string;
    institution_id: string;
    full_name: string;
    institutions: { name: string } | null;
  }>).map((row) => ({
    id: row.id,
    institution_id: row.institution_id,
    full_name: row.full_name,
    institution_name: row.institutions?.name ?? "—",
  }));
}
