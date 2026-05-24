"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
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

  if (!fullName || !phone || !email) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent("יש למלא שם, טלפון ואימייל.")}`);
  }

  const payload: InstructorUpdate = {
    full_name: fullName,
    phone,
    email,
  };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("instructors").update(payload).eq("id", instructorId);

  if (error) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(INSTRUCTORS_PATH);
  redirect(`${INSTRUCTORS_PATH}?success=updated`);
}

export async function setInstructorActiveAction(
  instructorId: string,
  userId: string | null,
  active: boolean,
): Promise<void> {
  await requireAdmin();

  if (!userId) {
    redirect(
      `${INSTRUCTORS_PATH}?error=${encodeURIComponent("למדריך ללא חשבון מערכת אין מצב פעיל/מושבת.")}`,
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({ notifications_enabled: active })
    .eq("id", userId);

  if (error) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(INSTRUCTORS_PATH);
  redirect(`${INSTRUCTORS_PATH}?success=${active ? "activated" : "deactivated"}`);
}
