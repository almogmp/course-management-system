"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function archiveCourseAction(courseId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("courses")
    .update({ status: "archived" })
    .eq("id", courseId);

  if (error) {
    redirectWithError(`/courses/${courseId}/sessions`, error.message);
  }

  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}/sessions`);
  redirect("/courses?success=course_archived");
}

export async function deactivateInstitutionAction(institutionId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("institutions")
    .update({ is_active: false })
    .eq("id", institutionId);

  if (error) {
    redirectWithError(`/institutions/${institutionId}`, error.message);
  }

  revalidatePath("/institutions");
  redirect("/institutions?success=institution_deactivated");
}

export async function deactivateSupplierAction(supplierId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("primary_suppliers")
    .update({ is_active: false })
    .eq("id", supplierId);

  if (error) {
    redirectWithError("/suppliers", error.message);
  }

  revalidatePath("/suppliers");
  redirect("/suppliers?success=supplier_deactivated");
}

export async function deactivateInstructorRecordAction(instructorId: string): Promise<void> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  const { data: instructor, error: fetchError } = await supabase
    .from("instructors")
    .select("id, user_id")
    .eq("id", instructorId)
    .maybeSingle();

  if (fetchError) {
    redirectWithError("/admin/instructors", fetchError.message);
  }

  if (!instructor) {
    redirectWithError("/admin/instructors", "המדריך לא נמצא.");
  }

  const { error } = await supabase
    .from("instructors")
    .update({ is_active: false })
    .eq("id", instructorId);

  if (error) {
    redirectWithError("/admin/instructors", error.message);
  }

  if (instructor.user_id) {
    await supabase
      .from("profiles")
      .update({ notifications_enabled: false })
      .eq("id", instructor.user_id);
  }

  revalidatePath("/admin/instructors");
  redirect("/admin/instructors?success=deactivated");
}
