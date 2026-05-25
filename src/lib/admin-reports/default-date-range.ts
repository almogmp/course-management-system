import { toLocalDateKey } from "@/lib/date/week";

export function getDefaultAdminReportDateRange(): { fromDate: string; toDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    fromDate: toLocalDateKey(start),
    toDate: toLocalDateKey(end),
  };
}

export function formatReportDateRangeLabel(fromDate: string, toDate: string): string {
  const formatter = new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${formatter.format(new Date(`${fromDate}T12:00:00`))} – ${formatter.format(new Date(`${toDate}T12:00:00`))}`;
}
