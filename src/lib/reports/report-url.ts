import {
  formatMonthParam,
  shiftMonthView,
  type MonthView,
} from "@/components/calendar/month-calendar-utils";

export type ReportSearchParams = {
  month?: string;
  filterInstructor?: string;
  filterInstitution?: string;
  filterStatus?: string;
};

export function buildReportsUrl(
  monthView: MonthView,
  searchParams?: ReportSearchParams,
): string {
  const params = new URLSearchParams();
  params.set("month", formatMonthParam(monthView));

  if (searchParams?.filterInstructor) {
    params.set("filterInstructor", searchParams.filterInstructor);
  }

  if (searchParams?.filterInstitution) {
    params.set("filterInstitution", searchParams.filterInstitution);
  }

  if (searchParams?.filterStatus) {
    params.set("filterStatus", searchParams.filterStatus);
  }

  const query = params.toString();

  return query ? `/reports?${query}` : "/reports";
}

export function buildReportsMonthNavUrls(
  monthView: MonthView,
  searchParams?: ReportSearchParams,
): { previousHref: string; nextHref: string } {
  return {
    previousHref: buildReportsUrl(shiftMonthView(monthView, -1), searchParams),
    nextHref: buildReportsUrl(shiftMonthView(monthView, 1), searchParams),
  };
}
