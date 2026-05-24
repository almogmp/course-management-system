/** תרגום ידידותי לשגיאות נפוצות מ-Supabase Auth */
export function toHebrewAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("user already exists")
  ) {
    return "כתובת הדוא\"ל כבר רשומה במערכת. נסה להתחבר.";
  }

  if (normalized.includes("invalid email") || normalized.includes("unable to validate email")) {
    return "כתובת הדוא\"ל אינה תקינה.";
  }

  if (
    normalized.includes("password") &&
    (normalized.includes("short") || normalized.includes("least"))
  ) {
    return "הסיסמה חייבת להכיל לפחות 6 תווים.";
  }

  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "בוצעו יותר מדי ניסיונות. נסה שוב בעוד כמה דקות.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "בעיית תקשורת. בדוק את החיבור לאינטרנט ונסה שוב.";
  }

  if (normalized.includes("signup is disabled")) {
    return "הרשמה חדשה אינה זמינה כרגע. פנה למנהל המערכת.";
  }

  return "ההרשמה נכשלה. בדוק את הפרטים ונסה שוב.";
}
