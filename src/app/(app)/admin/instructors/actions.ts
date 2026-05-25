"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { setInstructorPasswordForAdmin } from "@/lib/auth/admin-instructor-password";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type InstructorInsert = Database["public"]["Tables"]["instructors"]["Insert"];
type InstructorUpdate = Database["public"]["Tables"]["instructors"]["Update"];

const INSTRUCTORS_PATH = "/admin/instructors";

function randomColor(): string {
  const palette = ["#2563EB", "#059669", "#D97706", "#7C3AED", "#DC2626", "#0891B2"];
  return palette[Math.floor(Math.random() * palette.length)] ?? "#2563EB";
}

export async function createInstructorAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!fullName || !phone || !email) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent("יש למלא שם, טלפון ואימייל.")}`);
  }

  const payload: InstructorInsert = {
    full_name: fullName,
    phone,
    email,
    color: randomColor(),
    user_id: null,
    is_active: true,
  };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("instructors").insert(payload);

  if (error) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(INSTRUCTORS_PATH);
  redirect(`${INSTRUCTORS_PATH}?success=created`);
}

export async function updateInstructorAction(
  instructorId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const newPassword = String(formData.get("new_password") ?? "");

  if (!fullName || !phone || !email) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent("יש למלא שם, טלפון ואימייל.")}`);
  }

  const supabase = await createServerSupabaseClient();

  const { data: existing, error: fetchError } = await supabase
    .from("instructors")
    .select("id, user_id")
    .eq("id", instructorId)
    .maybeSingle();

  if (fetchError) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent(fetchError.message)}`);
  }

  if (!existing) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent("המדריך לא נמצא.")}`);
  }

  let linkedUserId = existing.user_id;

  if (newPassword.trim()) {
    const passwordResult = await setInstructorPasswordForAdmin({
      email,
      fullName,
      phone,
      userId: existing.user_id,
      newPassword: newPassword.trim(),
    });

    if (!passwordResult.ok) {
      redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent(passwordResult.error)}`);
    }

    linkedUserId = passwordResult.userId;
  }

  const payload: InstructorUpdate = {
    full_name: fullName,
    phone,
    email,
    ...(linkedUserId && linkedUserId !== existing.user_id ? { user_id: linkedUserId } : {}),
  };

  const { error } = await supabase.from("instructors").update(payload).eq("id", instructorId);

  if (error) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(INSTRUCTORS_PATH);
  redirect(
    `${INSTRUCTORS_PATH}?success=${newPassword.trim() ? "updated_with_password" : "updated"}`,
  );
}

export async function setInstructorActiveAction(
  instructorId: string,
  active: boolean,
): Promise<void> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  const { data: instructor, error: fetchError } = await supabase
    .from("instructors")
    .select("id, user_id")
    .eq("id", instructorId)
    .maybeSingle();

  if (fetchError) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent(fetchError.message)}`);
  }

  if (!instructor) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent("המדריך לא נמצא.")}`);
  }

  const { error } = await supabase
    .from("instructors")
    .update({ is_active: active })
    .eq("id", instructorId);

  if (error) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent(error.message)}`);
  }

  if (!active && instructor.user_id) {
    await supabase
      .from("profiles")
      .update({ notifications_enabled: false })
      .eq("id", instructor.user_id);
  }

  revalidatePath(INSTRUCTORS_PATH);
  revalidatePath("/courses");
  redirect(`${INSTRUCTORS_PATH}?success=${active ? "activated" : "deactivated"}`);
}

