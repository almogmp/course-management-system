"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { setPasswordForAdmin } from "@/lib/auth/admin-instructor-password";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const INSTRUCTORS_PATH = "/admin/instructors";

export async function resetAdminPasswordAction(
  targetUserId: string,
  formData: FormData,
): Promise<void> {
  const { user } = await requireAdmin();

  if (!user?.email) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent("לא נמצא חשבון מחובר.")}`);
  }

  const newPassword = String(formData.get("new_password") ?? "").trim();

  if (!newPassword) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent("יש להזין סיסמה חדשה.")}`);
  }

  const admin = createSupabaseAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, email")
    .eq("id", targetUserId)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !profile?.email) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent("מנהל לא נמצא.")}`);
  }

  const passwordResult = await setPasswordForAdmin({
    actorEmail: user.email,
    targetEmail: profile.email,
    fullName: profile.email,
    phone: "0000000000",
    userId: profile.id,
    newPassword,
  });

  if (!passwordResult.ok) {
    redirect(`${INSTRUCTORS_PATH}?error=${encodeURIComponent(passwordResult.error)}`);
  }

  revalidatePath(INSTRUCTORS_PATH);
  redirect(`${INSTRUCTORS_PATH}?success=admin_password_updated`);
}
