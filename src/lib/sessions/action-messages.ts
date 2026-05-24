const ERROR_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /Arrival can only be confirmed from planned/i,
    message: "ניתן לאשר הגעה רק כשהמפגש במצב מתוכנן.",
  },
  {
    pattern: /Session can only start after arrival/i,
    message: "יש לאשר הגעה לפני התחלת המפגש.",
  },
  {
    pattern: /Invalid transition to completed/i,
    message: "לא ניתן לסיים מפגש במצב הנוכחי.",
  },
  {
    pattern: /Cannot mark completed before session end/i,
    message: "לא ניתן לסמן כבוצע לפני סיום זמן המפגש.",
  },
  {
    pattern: /Cancellation can only be requested from planned/i,
    message: "ניתן לבקש ביטול רק ממפגש מתוכנן.",
  },
  {
    pattern: /Instructor cannot update this session/i,
    message: "אין הרשאה לעדכן מפגש זה.",
  },
  {
    pattern: /Instructor cannot cancel directly/i,
    message: "לא ניתן לבטל ישירות — יש לשלוח בקשה לאישור.",
  },
  {
    pattern: /column .* does not exist/i,
    message: "שגיאת מסד נתונים — יש לוודא שהמיגרציה האחרונה הוחלה.",
  },
];

export function mapSessionActionError(raw: string | null | undefined): string {
  if (!raw?.trim()) {
    return "הפעולה נכשלה. נסו שוב.";
  }

  for (const { pattern, message } of ERROR_PATTERNS) {
    if (pattern.test(raw)) {
      return message;
    }
  }

  return raw;
}

export const SESSION_ACTION_SUCCESS = {
  arrival: "ההגעה אושרה בהצלחה.",
  start: "המפגש התחיל בהצלחה.",
  end: "המפגש סומן כבוצע.",
  status: "הסטטוס עודכן בהצלחה.",
} as const;
