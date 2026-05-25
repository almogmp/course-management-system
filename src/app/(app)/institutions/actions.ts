"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type InstitutionInsert = Database["public"]["Tables"]["institutions"]["Insert"];
type SupplierInsert = Database["public"]["Tables"]["primary_suppliers"]["Insert"];

const INSTITUTIONS_PATH = "/institutions";
const LEGACY_COORDINATOR = "—";

export async function createInstitutionAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const isOwnSupplier = formData.get("is_own_supplier") === "1";
  let primarySupplierId = String(formData.get("primary_supplier_id") ?? "").trim();

  if (!name) {
    redirect(
      `${INSTITUTIONS_PATH}?create=1&error=${encodeURIComponent("יש להזין שם מוסד.")}`,
    );
  }

  if (!isOwnSupplier && !primarySupplierId) {
    redirect(
      `${INSTITUTIONS_PATH}?create=1&error=${encodeURIComponent("יש לבחור ספק או לסמן שהמוסד הוא הספק.")}`,
    );
  }

  const supabase = await createServerSupabaseClient();

  if (isOwnSupplier) {
    const supplierPayload: SupplierInsert = {
      name,
      contact_name: "",
      phone: "",
      email: "",
      notes: notes || null,
      is_active: true,
    };

    const { data: supplier, error: supplierError } = await supabase
      .from("primary_suppliers")
      .insert(supplierPayload)
      .select("id")
      .single();

    if (supplierError || !supplier) {
      redirect(
        `${INSTITUTIONS_PATH}?create=1&error=${encodeURIComponent(supplierError?.message ?? "יצירת ספק נכשלה.")}`,
      );
    }

    primarySupplierId = supplier.id;
  }

  const institutionPayload: InstitutionInsert = {
    name,
    city: city || "—",
    address: "—",
    phone: "",
    coordinator: LEGACY_COORDINATOR,
    notes: notes || null,
    primary_supplier_id: primarySupplierId,
    is_own_supplier: isOwnSupplier,
    is_active: true,
  };

  const { error } = await supabase.from("institutions").insert(institutionPayload);

  if (error) {
    redirect(`${INSTITUTIONS_PATH}?create=1&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(INSTITUTIONS_PATH);
  revalidatePath("/courses");
  revalidatePath("/suppliers");
  redirect(`${INSTITUTIONS_PATH}?success=created`);
}
