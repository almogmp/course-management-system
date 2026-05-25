"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CoordinatorInsert = Database["public"]["Tables"]["institution_coordinators"]["Insert"];
type CoordinatorUpdate = Database["public"]["Tables"]["institution_coordinators"]["Update"];

function institutionPath(institutionId: string): string {
  return `/institutions/${institutionId}`;
}

export async function updateInstitutionAction(
  institutionId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const isOwnSupplier = formData.get("is_own_supplier") === "1";
  const primarySupplierId = String(formData.get("primary_supplier_id") ?? "").trim();

  if (!name || !city) {
    redirect(
      `${institutionPath(institutionId)}?error=${encodeURIComponent("יש למלא שם ועיר.")}`,
    );
  }

  if (!isOwnSupplier && !primarySupplierId) {
    redirect(
      `${institutionPath(institutionId)}?error=${encodeURIComponent("יש לבחור ספק או לסמן שהמוסד הוא הספק.")}`,
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("institutions")
    .update({
      name,
      city,
      phone: phone || "",
      is_own_supplier: isOwnSupplier,
      primary_supplier_id: isOwnSupplier ? null : primarySupplierId,
    })
    .eq("id", institutionId);

  if (error) {
    redirect(`${institutionPath(institutionId)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(institutionPath(institutionId));
  revalidatePath("/institutions");
  revalidatePath("/courses");
  redirect(`${institutionPath(institutionId)}?success=institution_updated`);
}

export async function createInstitutionCoordinatorAction(
  institutionId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!fullName) {
    redirect(
      `${institutionPath(institutionId)}?error=${encodeURIComponent("יש להזין שם רכז.")}`,
    );
  }

  const payload: CoordinatorInsert = {
    institution_id: institutionId,
    full_name: fullName,
    phone: phone || null,
    email: email || null,
    is_active: true,
  };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("institution_coordinators").insert(payload);

  if (error) {
    redirect(`${institutionPath(institutionId)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(institutionPath(institutionId));
  revalidatePath("/institutions");
  revalidatePath("/courses");
  redirect(`${institutionPath(institutionId)}?success=coordinator_created`);
}

export async function updateInstitutionCoordinatorAction(
  institutionId: string,
  coordinatorId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!fullName) {
    redirect(
      `${institutionPath(institutionId)}?error=${encodeURIComponent("יש להזין שם רכז.")}`,
    );
  }

  const payload: CoordinatorUpdate = {
    full_name: fullName,
    phone: phone || null,
    email: email || null,
    is_active: isActive,
  };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("institution_coordinators")
    .update(payload)
    .eq("id", coordinatorId)
    .eq("institution_id", institutionId);

  if (error) {
    redirect(`${institutionPath(institutionId)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(institutionPath(institutionId));
  revalidatePath("/courses");
  redirect(`${institutionPath(institutionId)}?success=coordinator_updated`);
}

export async function deactivateInstitutionCoordinatorAction(
  institutionId: string,
  coordinatorId: string,
): Promise<void> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("institution_coordinators")
    .update({ is_active: false })
    .eq("id", coordinatorId)
    .eq("institution_id", institutionId);

  if (error) {
    redirect(`${institutionPath(institutionId)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(institutionPath(institutionId));
  revalidatePath("/courses");
  redirect(`${institutionPath(institutionId)}?success=coordinator_removed`);
}
