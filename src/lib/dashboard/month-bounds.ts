import type { MonthView } from "@/components/calendar/month-calendar-utils";
import { toLocalDateKey } from "@/lib/date/week";

/** תחילת וסוף חודש לוח (לא רשת יומן) */
export function getMonthBounds(view: MonthView): { startDate: string; endDate: string } {
  const start = new Date(view.year, view.month, 1);
  const end = new Date(view.year, view.month + 1, 0);

  return {
    startDate: toLocalDateKey(start),
    endDate: toLocalDateKey(end),
  };
}

export function isSessionInMonth(sessionDate: string, view: MonthView): boolean {
  const date = new Date(`${sessionDate}T12:00:00`);

  return date.getFullYear() === view.year && date.getMonth() === view.month;
}
