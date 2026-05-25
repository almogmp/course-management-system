import { formatMonthParam, type MonthView } from "@/components/calendar/month-calendar-utils";

export function buildSessionsPageUrl(monthView: MonthView): string {
  return `/sessions?month=${formatMonthParam(monthView)}`;
}
