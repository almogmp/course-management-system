"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { adminSelectProfilesByIds } from "@/lib/admin/admin-profiles-server";
import { requireAdmin } from "@/lib/auth/guards";
import { setPasswordForAdmin } from "@/lib/auth/admin-instructor-password";

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

  const profilesResult = await adminSelectProfilesByIds("resetAdminPasswordAction", [targetUserId]);

  if (!profilesResult.ok) {
    redirect(
      `${INSTRUCTORS_PATH}?error=${encodeURIComponent("לא ניתן לטעון פרופיל מנהל.")}`,
    );
  }

  const profile = profilesResult.profiles.find(
    (row) => row.id === targetUserId && row.role === "admin",
  );

  if (!profile?.email) {
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
