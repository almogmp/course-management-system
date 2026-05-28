import { coerceSessionHours } from "@/lib/sessions/coerce-session-hours";

/** פורמט תאריך ושעה להצגה בעברית */
export function formatSessionDate(sessionDate: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${sessionDate}T12:00:00`));
}

/** TIME מ-Postgres → HH:MM */
export function formatSessionTime(time: string): string {
  return time.slice(0, 5);
}

export function formatSessionTimeRange(startTime: string, endTime: string): string {
  return `${formatSessionTime(startTime)} – ${formatSessionTime(endTime)}`;
}

export function formatSessionHours(hours: number): string {
  return new Intl.NumberFormat("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(hours);
}

/** שעות לטבלאות — תמיד ערך מוצג, ללא תא ריק */
export function formatSessionHoursDisplay(hours: number | null | undefined | unknown): string {
  const normalized = coerceSessionHours(hours);
  if (normalized === 0 && (hours === null || hours === undefined || hours === "")) {
    return "0";
  }

  return formatSessionHours(normalized);
}

/** Debug-safe raw label for instructor hours (instructor UI only). */
export function formatSessionHoursRawDebug(hours: unknown): string {
  if (hours === null) {
    return "null";
  }

  if (hours === undefined) {
    return "undefined";
  }

  return String(hours);
}

/** TIME מ-Postgres → ערך ל-input type="time" */
export function formatTimeForInput(time: string): string {
  return time.slice(0, 5);
}

export function isSessionToday(sessionDate: string): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  return sessionDate === today;
}
