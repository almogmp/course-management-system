/** Super admin — full control including other admins. */
export const SUPER_ADMIN_EMAIL = "almogg57@gmail.com" as const;

/** Admin emails (manager access; not super admin). */
export const ADMIN_EMAILS = [SUPER_ADMIN_EMAIL, "shimi.adda@gmail.com"] as const;

export type AdminEmail = (typeof ADMIN_EMAILS)[number];

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return ADMIN_EMAILS.includes(normalized as AdminEmail);
}

export function isSuperAdminEmail(email: string): boolean {
  return normalizeEmail(email) === SUPER_ADMIN_EMAIL;
}
