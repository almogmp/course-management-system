/** כתובת המייל היחידה עם הרשאות מנהל במערכת */
export const ADMIN_EMAIL = "almogg57@gmail.com";

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
