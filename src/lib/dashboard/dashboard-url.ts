import {
  formatMonthParam,
  shiftMonthView,
  type MonthView,
} from "@/components/calendar/month-calendar-utils";

export type DashboardSearchParams = {
  calendarView?: string;
  week?: string;
  month?: string;
  filterInstructor?: string;
  filterInstitution?: string;
  filterCourse?: string;
  filterStatus?: string;
};

export function buildDashboardUrl(
  monthView: MonthView,
  searchParams?: DashboardSearchParams,
): string {
  const params = new URLSearchParams();
  params.set("month", formatMonthParam(monthView));

  if (searchParams?.calendarView) {
    params.set("calendarView", searchParams.calendarView);
  }

  if (searchParams?.week) {
    params.set("week", searchParams.week);
  }

  if (searchParams?.filterInstructor) {
    params.set("filterInstructor", searchParams.filterInstructor);
  }

  if (searchParams?.filterInstitution) {
    params.set("filterInstitution", searchParams.filterInstitution);
  }

  if (searchParams?.filterCourse) {
    params.set("filterCourse", searchParams.filterCourse);
  }

  if (searchParams?.filterStatus) {
    params.set("filterStatus", searchParams.filterStatus);
  }

  return `/dashboard?${params.toString()}`;
}

export function buildDashboardMonthNavUrls(
  monthView: MonthView,
  searchParams?: DashboardSearchParams,
): {
  previousHref: string;
  nextHref: string;
} {
  return {
    previousHref: buildDashboardUrl(shiftMonthView(monthView, -1), searchParams),
    nextHref: buildDashboardUrl(shiftMonthView(monthView, 1), searchParams),
  };
}
