/** Maps internal errors to user-safe Hebrew messages (no raw stack traces in production). */
export function getSafeErrorMessage(error: unknown, fallback = "אירעה שגיאה. נסו שוב מאוחר יותר."): string {
  if (error instanceof Error && error.message.trim()) {
    const message = error.message.trim();

    if (process.env.NODE_ENV === "development") {
      return message;
    }

    if (/column .* does not exist/i.test(message)) {
      return "שגיאת מסד נתונים — יש לוודא שכל המיגרציות הוחלו.";
    }

    if (/JWT|session|auth/i.test(message)) {
      return "שגיאת התחברות. נסו להתחבר מחדש.";
    }

    if (/permission|denied|forbidden|not allowed/i.test(message)) {
      return "אין הרשאה לבצע פעולה זו.";
    }

    if (/network|fetch|timeout|ECONNREFUSED/i.test(message)) {
      return "שגיאת תקשורת. בדקו את החיבור ונסו שוב.";
    }
  }

  return fallback;
}

export function logServerError(scope: string, error: unknown): void {
  console.error(`[${scope}]`, error);
}
