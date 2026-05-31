import "server-only";

import { isAdminEmail } from "@/config/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * After OAuth sign-in, link auth user to existing instructor/admin rows by email.
 * Prevents duplicate instructor records when the user already exists in the DB.
 */
export async function linkOAuthUserByEmail(
  userId: string,
  email: string,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const admin = createSupabaseAdminClient();

  if (isAdminEmail(normalized)) {
    await admin
      .from("profiles")
      .update({
        role: "admin",
        approval_status: "approved",
        notifications_enabled: true,
      })
      .eq("id", userId);

    return;
  }

  const { data: instructor } = await admin
    .from("instructors")
    .select("id, user_id")
    .eq("email", normalized)
    .maybeSingle();

  if (instructor && (!instructor.user_id || instructor.user_id === userId)) {
    await admin
      .from("instructors")
      .update({ user_id: userId, is_active: true })
      .eq("id", instructor.id);

    await admin
      .from("profiles")
      .update({
        approval_status: "approved",
        notifications_enabled: true,
      })
      .eq("id", userId)
      .eq("role", "instructor");
  }
}
