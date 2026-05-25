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
export function formatSessionHoursDisplay(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || Number.isNaN(hours)) {
    return "—";
  }

  return formatSessionHours(hours);
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
