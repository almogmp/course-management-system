/** Allowed admin emails (in addition to `profiles.role = 'admin'`). */
export const ADMIN_EMAILS = ["almogg57@gmail.com", "shimi.adda@gmail.com"] as const;

export function isAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized as (typeof ADMIN_EMAILS)[number]);
}
