import "server-only";

import { isAdminEmail } from "@/config/admin";
import {
  adminPasswordDeniedMessage,
  canActorResetPasswordFor,
} from "@/lib/auth/admin-permissions";
import { toHebrewPasswordAdminError } from "@/lib/auth/supabase-errors";
import { logServerError } from "@/lib/errors/safe-error-message";
import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin";

const MIN_PASSWORD_LENGTH = 6;

export type SetInstructorPasswordResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return "הסיסמה חייבת להכיל לפחות 6 תווים.";
  }

  return null;
}

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const adminResult = tryCreateSupabaseAdminClient();

  if (!adminResult.ok) {
    return null;
  }

  const admin = adminResult.client;
  const normalized = email.toLowerCase();

  const { data: profileRow } = await admin
    .from("profiles")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();

  if (profileRow?.id) {
    return profileRow.id;
  }

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      logServerError("findAuthUserIdByEmail.listUsers", error);
      return null;
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === normalized);

    if (match?.id) {
      return match.id;
    }

    if (data.users.length < 200) {
      break;
    }
  }

  return null;
}

async function ensureInstructorProfileApproved(
  userId: string,
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const adminResult = tryCreateSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const admin = adminResult.client;
  const normalizedEmail = email.toLowerCase();

  const { data: existing, error: fetchError } = await admin
    .from("profiles")
    .select("id, role, approval_status")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError) {
    logServerError("ensureInstructorProfileApproved.fetch", fetchError);
    return { ok: false, error: "לא ניתן לטעון פרופיל משתמש." };
  }

  if (!existing) {
    const { error: insertError } = await admin.from("profiles").insert({
      id: userId,
      email: normalizedEmail,
      role: "instructor",
      approval_status: "approved",
      notifications_enabled: true,
    });

    if (insertError) {
      logServerError("ensureInstructorProfileApproved.insert", insertError);
      return {
        ok: false,
        error: toHebrewPasswordAdminError(insertError.message),
      };
    }

    return { ok: true };
  }

  if (existing.role === "admin") {
    return { ok: true };
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      approval_status: "approved",
      notifications_enabled: true,
      email: normalizedEmail,
    })
    .eq("id", userId)
    .eq("role", "instructor");

  if (updateError) {
    logServerError("ensureInstructorProfileApproved.update", updateError);
    return {
      ok: false,
      error: toHebrewPasswordAdminError(updateError.message),
    };
  }

  return { ok: true };
}

async function linkInstructorToAuthUser(input: {
  instructorId?: string;
  email: string;
  userId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const adminResult = tryCreateSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const admin = adminResult.client;
  const normalizedEmail = input.email.toLowerCase();

  const query = admin.from("instructors").update({ user_id: input.userId });

  const { error } = input.instructorId
    ? await query.eq("id", input.instructorId)
    : await query.eq("email", normalizedEmail).is("user_id", null);

  if (error) {
    logServerError("linkInstructorToAuthUser", error);

    if (error.code === "23505") {
      return {
        ok: false,
        error: "כתובת הדוא\"ל כבר מקושרת למשתמש אחר. פנה למנהל המערכת.",
      };
    }

    return {
      ok: false,
      error: toHebrewPasswordAdminError(error.message),
    };
  }

  return { ok: true };
}

/**
 * Sets or resets a user password via Supabase Auth Admin API (never stores plain text).
 */
export async function setPasswordForAdmin(input: {
  actorEmail: string;
  targetEmail: string;
  fullName: string;
  phone: string;
  userId: string | null;
  instructorId?: string;
  newPassword: string;
}): Promise<SetInstructorPasswordResult> {
  const password = input.newPassword;
  const email = input.targetEmail.trim().toLowerCase();

  if (!canActorResetPasswordFor(input.actorEmail, email)) {
    return { ok: false, error: adminPasswordDeniedMessage(input.actorEmail, email) };
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    return { ok: false, error: passwordError };
  }

  const adminResult = tryCreateSupabaseAdminClient();

  if (!adminResult.ok) {
    return adminResult;
  }

  const admin = adminResult.client;
  const targetIsAdmin = isAdminEmail(email);

  let resolvedUserId = input.userId;

  async function applyPasswordToUser(userId: string): Promise<SetInstructorPasswordResult> {
    const { error } = await admin.auth.admin.updateUserById(userId, { password });

    if (error) {
      logServerError("setPasswordForAdmin.updateUserById", error);
      return { ok: false, error: toHebrewPasswordAdminError(error.message) };
    }

    if (!targetIsAdmin) {
      const profileResult = await ensureInstructorProfileApproved(userId, email);

      if (!profileResult.ok) {
        return profileResult;
      }

      if (input.instructorId) {
        const linkResult = await linkInstructorToAuthUser({
          instructorId: input.instructorId,
          email,
          userId,
        });

        if (!linkResult.ok) {
          return linkResult;
        }
      }
    }

    return { ok: true, userId };
  }

  if (resolvedUserId) {
    return applyPasswordToUser(resolvedUserId);
  }

  const existingAuthUserId = await findAuthUserIdByEmail(email);

  if (existingAuthUserId) {
    resolvedUserId = existingAuthUserId;
    return applyPasswordToUser(resolvedUserId);
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
      phone: input.phone,
    },
  });

  if (!createError && created.user?.id) {
    resolvedUserId = created.user.id;

    if (!targetIsAdmin) {
      const profileResult = await ensureInstructorProfileApproved(resolvedUserId, email);

      if (!profileResult.ok) {
        return profileResult;
      }

      const linkResult = await linkInstructorToAuthUser({
        instructorId: input.instructorId,
        email,
        userId: resolvedUserId,
      });

      if (!linkResult.ok) {
        return linkResult;
      }
    }

    return { ok: true, userId: resolvedUserId };
  }

  const message = createError?.message.toLowerCase() ?? "";
  const alreadyExists =
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists");

  if (!alreadyExists) {
    logServerError("setPasswordForAdmin.createUser", createError);
    return {
      ok: false,
      error: toHebrewPasswordAdminError(createError?.message ?? "יצירת משתמש נכשלה."),
    };
  }

  const userIdFromAuth = await findAuthUserIdByEmail(email);

  if (!userIdFromAuth) {
    return {
      ok: false,
      error: "כתובת הדוא\"ל כבר רשומה אך לא ניתן לקשר את החשבון. פנה לתמיכה.",
    };
  }

  return applyPasswordToUser(userIdFromAuth);
}

/** @deprecated Use setPasswordForAdmin */
export async function setInstructorPasswordForAdmin(
  input: Parameters<typeof setPasswordForAdmin>[0],
): Promise<SetInstructorPasswordResult> {
  return setPasswordForAdmin(input);
}
