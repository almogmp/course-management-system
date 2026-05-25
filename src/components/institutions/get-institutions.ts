import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type InstitutionListItem = Pick<
  Database["public"]["Tables"]["institutions"]["Row"],
  "id" | "name" | "city" | "coordinator" | "phone"
> & {
  supplier_name: string | null;
};

type InstitutionQueryRow = Pick<
  Database["public"]["Tables"]["institutions"]["Row"],
  "id" | "name" | "city" | "coordinator" | "phone"
> & {
  primary_suppliers: Pick<Database["public"]["Tables"]["primary_suppliers"]["Row"], "name"> | null;
};

export async function getInstitutions(options?: {
  includeInactive?: boolean;
}): Promise<InstitutionListItem[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("institutions")
    .select("id, name, city, coordinator, phone, primary_suppliers(name)")
    .order("name", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as InstitutionQueryRow[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    coordinator: row.coordinator,
    phone: row.phone,
    supplier_name: row.primary_suppliers?.name ?? null,
  }));
}
