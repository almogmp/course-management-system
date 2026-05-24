import {
  formatMonthLabel,
  getMonthCalendarDays,
  type MonthView,
} from "@/components/calendar/month-calendar-utils";
import { getCalendarSessionsInRange } from "@/components/calendar/get-weekly-sessions";
import type { WeeklyCalendarSession } from "@/components/calendar/types";

export async function getMonthlySessions(
  isAdmin: boolean,
  monthView: MonthView,
): Promise<{
  monthView: MonthView;
  calendarDays: ReturnType<typeof getMonthCalendarDays>;
  sessions: WeeklyCalendarSession[];
}> {
  const calendarDays = getMonthCalendarDays(monthView);
  const startDate = calendarDays[0]?.dateKey;
  const endDate = calendarDays[calendarDays.length - 1]?.dateKey;

  if (!startDate || !endDate) {
    return { monthView, calendarDays, sessions: [] };
  }

  const sessions = await getCalendarSessionsInRange(isAdmin, startDate, endDate);

  return { monthView, calendarDays, sessions };
}

export { formatMonthLabel };
