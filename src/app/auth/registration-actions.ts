"use server";

import { revalidatePath } from "next/cache";

import { isAdminEmail } from "@/config/admin";
import { DEFAULT_INSTRUCTOR_COLOR } from "@/lib/auth/constants";
import { getAuthSnapshot } from "@/lib/auth/session";
import { toHebrewAuthError } from "@/lib/auth/supabase-errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type RegistrationResult =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; error: string };

export async function registerInstructorAction(input: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}): Promise<RegistrationResult> {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!fullName || !phone || !email || !password) {
    return { ok: false, error: "יש למלא את כל השדות." };
  }

  if (isAdminEmail(email)) {
    return {
      ok: false,
      error: "כתובת זו שמורה למנהל המערכת. התחברות דרך דף ההתחברות.",
    };
  }

  const supabase = await createServerSupabaseClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
    },
  });

  if (signUpError) {
    return { ok: false, error: toHebrewAuthError(signUpError.message) };
  }

  const userId = signUpData.user?.id;

  if (!userId) {
    return { ok: false, error: "ההרשמה נכשלה. נסה שוב." };
  }

  const { data: existingInstructor } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existingInstructor) {
    const { error: instructorError } = await supabase.from("instructors").insert({
      user_id: userId,
      full_name: fullName,
      phone,
      email,
      color: DEFAULT_INSTRUCTOR_COLOR,
    });

    if (instructorError) {
      return { ok: false, error: toHebrewAuthError(instructorError.message) };
    }
  }

  return {
    ok: true,
    needsEmailConfirmation: !signUpData.session,
  };
}

export type ApprovalActionResult = { ok: true } | { ok: false; error: string };

export async function approveInstructorAction(
  profileId: string,
): Promise<ApprovalActionResult> {
  const { isAdmin } = await getAuthSnapshot();
  if (!isAdmin) {
    return { ok: false, error: "אין הרשאה לפעולה זו." };
  }

  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approval_status")
    .eq("id", profileId)
    .single();

  if (!profile || profile.role !== "instructor" || profile.approval_status !== "pending") {
    return { ok: false, error: "בקשה לא נמצאה או כבר טופלה." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ approval_status: "approved" })
    .eq("id", profileId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/instructor-approvals");
  return { ok: true };
}

export async function rejectInstructorAction(
  profileId: string,
): Promise<ApprovalActionResult> {
  const { isAdmin } = await getAuthSnapshot();
  if (!isAdmin) {
    return { ok: false, error: "אין הרשאה לפעולה זו." };
  }

  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approval_status")
    .eq("id", profileId)
    .single();

  if (!profile || profile.role !== "instructor" || profile.approval_status !== "pending") {
    return { ok: false, error: "בקשה לא נמצאה או כבר טופלה." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ approval_status: "rejected" })
    .eq("id", profileId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/instructor-approvals");
  return { ok: true };
}
