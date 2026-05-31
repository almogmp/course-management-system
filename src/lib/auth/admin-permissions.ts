import {
  ADMIN_EMAILS,
  isAdminEmail,
  isSuperAdminEmail,
  normalizeEmail,
} from "@/config/admin";

export function canActorManageInstructors(actorEmail: string | undefined): boolean {
  return Boolean(actorEmail && isAdminEmail(actorEmail));
}

/** Only super admin may change another admin account (password, role). */
export function canActorManageAdminUser(
  actorEmail: string | undefined,
  targetEmail: string,
): boolean {
  if (!actorEmail || !isSuperAdminEmail(actorEmail)) {
    return false;
  }

  return isAdminEmail(targetEmail);
}

/**
 * Password reset rules:
 * - Super admin: any user (instructors + admins).
 * - Admin (Shimi): instructors only — not Almog, not other admins.
 */
export function canActorResetPasswordFor(
  actorEmail: string | undefined,
  targetEmail: string,
): boolean {
  if (!actorEmail) {
    return false;
  }

  const actor = normalizeEmail(actorEmail);
  const target = normalizeEmail(targetEmail);

  if (isSuperAdminEmail(actor)) {
    return true;
  }

  if (!isAdminEmail(actor)) {
    return false;
  }

  if (isSuperAdminEmail(target) || isAdminEmail(target)) {
    return false;
  }

  return true;
}

export function adminPasswordDeniedMessage(
  actorEmail: string | undefined,
  targetEmail: string,
): string {
  if (isSuperAdminEmail(normalizeEmail(targetEmail))) {
    return "רק מנהל-על יכול לשנות סיסמה של מנהל-על.";
  }

  if (isAdminEmail(targetEmail)) {
    return "רק מנהל-על יכול לשנות סיסמה של מנהל אחר.";
  }

  return "אין הרשאה לשנות סיסמה למשתמש זה.";
}

export { ADMIN_EMAILS };
