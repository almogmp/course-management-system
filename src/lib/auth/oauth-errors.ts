const GOOGLE_SETUP_HINT =
  "התחברות Google אינה מוגדרת ב-Supabase. בלוח הבקרה: Authentication → Providers → הפעילו Google, והוסיפו Redirect URL: {origin}/auth/callback";

export function mapOAuthLoginError(message: string, origin?: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("provider") && lower.includes("not enabled") ||
    lower.includes("unsupported provider") ||
    lower.includes("oauth provider")
  ) {
    const hint = origin
      ? GOOGLE_SETUP_HINT.replace("{origin}", origin)
      : GOOGLE_SETUP_HINT.replace("{origin}", "https://your-domain.com");

    return hint;
  }

  if (lower.includes("redirect") || lower.includes("callback")) {
    return `כתובת ההפניה אינה מורשית. ודאו ש-${origin ?? "הדומיין של האתר"}/auth/callback רשומה ב-Supabase תחת Authentication → URL Configuration.`;
  }

  return message;
}
