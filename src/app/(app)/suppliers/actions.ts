"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SupplierInsert = Database["public"]["Tables"]["primary_suppliers"]["Insert"];

const SUPPLIERS_PATH = "/suppliers";

export async function createSupplierAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const contactName = String(formData.get("contact_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    redirect(`${SUPPLIERS_PATH}?create=1&error=${encodeURIComponent("יש להזין שם ספק.")}`);
  }

  const payload: SupplierInsert = {
    name,
    contact_name: contactName,
    phone,
    email,
    notes: notes || null,
    is_active: true,
  };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("primary_suppliers").insert(payload);

  if (error) {
    redirect(`${SUPPLIERS_PATH}?create=1&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(SUPPLIERS_PATH);
  revalidatePath("/institutions");
  revalidatePath("/courses");
  redirect(`${SUPPLIERS_PATH}?success=created`);
}
