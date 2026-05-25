import "server-only";

import { isAdminEmail } from "@/config/admin";
import { toHebrewAuthError } from "@/lib/auth/supabase-errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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
  const admin = createSupabaseAdminClient();
  const normalized = email.toLowerCase();

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
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

async function ensureInstructorProfileApproved(userId: string, email: string): Promise<void> {
  if (isAdminEmail(email)) {
    return;
  }

  const admin = createSupabaseAdminClient();

  await admin
    .from("profiles")
    .update({ approval_status: "approved", notifications_enabled: true })
    .eq("id", userId)
    .eq("role", "instructor");
}

/**
 * Sets or resets an instructor login password via Supabase Auth Admin API.
 * Never logs or persists the plain-text password.
 */
export async function setInstructorPasswordForAdmin(input: {
  email: string;
  fullName: string;
  phone: string;
  userId: string | null;
  newPassword: string;
}): Promise<SetInstructorPasswordResult> {
  const password = input.newPassword;
  const email = input.email.trim().toLowerCase();

  if (isAdminEmail(email)) {
    return { ok: false, error: "לא ניתן לקבוע סיסמה לחשבון מנהל דרך טופס מדריך." };
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    return { ok: false, error: passwordError };
  }

  const admin = createSupabaseAdminClient();

  if (input.userId) {
    const { error } = await admin.auth.admin.updateUserById(input.userId, {
      password,
    });

    if (error) {
      return { ok: false, error: toHebrewAuthError(error.message) };
    }

    await ensureInstructorProfileApproved(input.userId, email);

    return { ok: true, userId: input.userId };
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
    await ensureInstructorProfileApproved(created.user.id, email);
    return { ok: true, userId: created.user.id };
  }

  const message = createError?.message.toLowerCase() ?? "";
  const alreadyExists =
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists");

  if (!alreadyExists) {
    return {
      ok: false,
      error: toHebrewAuthError(createError?.message ?? "יצירת משתמש נכשלה."),
    };
  }

  const existingUserId = await findAuthUserIdByEmail(email);

  if (!existingUserId) {
    return {
      ok: false,
      error: "כתובת הדוא\"ל כבר רשומה אך לא ניתן לקשר את החשבון. פנה לתמיכה.",
    };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(existingUserId, {
    password,
  });

  if (updateError) {
    return { ok: false, error: toHebrewAuthError(updateError.message) };
  }

  await ensureInstructorProfileApproved(existingUserId, email);

  return { ok: true, userId: existingUserId };
}
