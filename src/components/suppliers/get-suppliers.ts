import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type SupplierListItem = Pick<
  Database["public"]["Tables"]["primary_suppliers"]["Row"],
  "id" | "name" | "contact_name" | "phone" | "email"
>;

export async function getSuppliers(): Promise<SupplierListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("primary_suppliers")
    .select("id, name, contact_name, phone, email")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
