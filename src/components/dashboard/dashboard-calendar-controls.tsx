"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ADMIN_STATUS_OPTIONS,
  SESSION_STATUS_LABELS,
} from "@/components/sessions/constants";
import {
  formatMonthParam,
  shiftMonthView,
  type MonthView,
} from "@/components/calendar/month-calendar-utils";
import { buildDashboardUrl } from "@/lib/dashboard/dashboard-url";
import type { DashboardSearchParams } from "@/lib/dashboard/dashboard-url";
import { shiftWeekStart } from "@/lib/date/week";

export type DashboardCalendarView = "weekly" | "monthly";

type DashboardCalendarControlsProps = {
  view: DashboardCalendarView;
  weekStart: string;
  monthView: MonthView;
  searchParams?: DashboardSearchParams;
  filterOptions?: {
    instructors: Array<{ id: string; name: string }>;
    institutions: Array<{ id: string; name: string }>;
    courses: Array<{ id: string; name: string }>;
  };
  isAdmin: boolean;
};

function buildCalendarUrl(params: {
  view: DashboardCalendarView;
  weekStart: string;
  monthView: MonthView;
  searchParams?: DashboardSearchParams;
}): string {
  const nextParams: DashboardSearchParams = {
    ...params.searchParams,
    calendarView: params.view,
    month: formatMonthParam(params.monthView),
    week: params.view === "weekly" ? params.weekStart : params.searchParams?.week,
  };

  return buildDashboardUrl(params.monthView, nextParams);
}

const navButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted";

const toggleButtonClassName =
  "inline-flex min-h-10 flex-1 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors sm:flex-none sm:min-w-36";

const selectClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

export function DashboardCalendarControls({
  view,
  weekStart,
  monthView,
  searchParams,
  filterOptions,
  isAdmin,
}: DashboardCalendarControlsProps) {
  const router = useRouter();

  const weeklyHref = buildCalendarUrl({ view: "weekly", weekStart, monthView, searchParams });
  const monthlyHref = buildCalendarUrl({ view: "monthly", weekStart, monthView, searchParams });

  const previousWeekHref = buildCalendarUrl({
    view: "weekly",
    weekStart: shiftWeekStart(weekStart, -1),
    monthView,
    searchParams,
  });

  const nextWeekHref = buildCalendarUrl({
    view: "weekly",
    weekStart: shiftWeekStart(weekStart, 1),
    monthView,
    searchParams,
  });

  const previousMonthView = shiftMonthView(monthView, -1);
  const nextMonthView = shiftMonthView(monthView, 1);

  const previousMonthHref = buildCalendarUrl({
    view: "monthly",
    weekStart,
    monthView: previousMonthView,
    searchParams,
  });

  const nextMonthHref = buildCalendarUrl({
    view: "monthly",
    weekStart,
    monthView: nextMonthView,
    searchParams,
  });

  function updateFilter(key: keyof DashboardSearchParams, value: string) {
    const next: DashboardSearchParams = { ...searchParams, calendarView: view, month: formatMonthParam(monthView) };

    if (view === "weekly") {
      next.week = weekStart;
    }

    if (value) {
      next[key] = value;
    } else {
      delete next[key];
    }

    router.push(buildDashboardUrl(monthView, next));
  }

  const clearFiltersHref = buildDashboardUrl(monthView, {
    calendarView: view,
    month: formatMonthParam(monthView),
    week: view === "weekly" ? weekStart : undefined,
  });

  return (
    <div className="flex w-full flex-col gap-4 lg:max-w-xl">
      <div
        role="tablist"
        aria-label="תצוגת יומן"
        className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-1 sm:inline-flex sm:w-auto"
      >
        <Link
          href={weeklyHref}
          role="tab"
          aria-selected={view === "weekly"}
          className={`${toggleButtonClassName} ${view === "weekly" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          תצוגה שבועית
        </Link>
        <Link
          href={monthlyHref}
          role="tab"
          aria-selected={view === "monthly"}
          className={`${toggleButtonClassName} ${view === "monthly" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          תצוגה חודשית
        </Link>
      </div>

      {view === "weekly" ? (
        <nav aria-label="ניווט שבועי" className="flex flex-wrap items-center gap-2">
          <Link href={previousWeekHref} className={navButtonClassName}>
            שבוע קודם
          </Link>
          <Link href={nextWeekHref} className={navButtonClassName}>
            שבוע הבא
          </Link>
        </nav>
      ) : (
        <nav aria-label="ניווט חודשי" className="flex flex-wrap items-center gap-2">
          <Link href={previousMonthHref} className={navButtonClassName}>
            חודש קודם
          </Link>
          <Link href={nextMonthHref} className={navButtonClassName}>
            חודש הבא
          </Link>
        </nav>
      )}

      {filterOptions ? (
        <div className="grid gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-2">
          {isAdmin ? (
            <>
              <label className="space-y-1 text-start">
                <span className="text-xs font-medium text-muted-foreground">מדריך</span>
                <select
                  value={searchParams?.filterInstructor ?? ""}
                  onChange={(e) => updateFilter("filterInstructor", e.target.value)}
                  className={selectClassName}
                >
                  <option value="">הכל</option>
                  {filterOptions.instructors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-start">
                <span className="text-xs font-medium text-muted-foreground">מוסד</span>
                <select
                  value={searchParams?.filterInstitution ?? ""}
                  onChange={(e) => updateFilter("filterInstitution", e.target.value)}
                  className={selectClassName}
                >
                  <option value="">הכל</option>
                  {filterOptions.institutions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
          <label className="space-y-1 text-start">
            <span className="text-xs font-medium text-muted-foreground">קורס</span>
            <select
              value={searchParams?.filterCourse ?? ""}
              onChange={(e) => updateFilter("filterCourse", e.target.value)}
              className={selectClassName}
            >
              <option value="">הכל</option>
              {filterOptions.courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-start">
            <span className="text-xs font-medium text-muted-foreground">סטטוס</span>
            <select
              value={searchParams?.filterStatus ?? ""}
              onChange={(e) => updateFilter("filterStatus", e.target.value)}
              className={selectClassName}
            >
              <option value="">הכל</option>
              {ADMIN_STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {SESSION_STATUS_LABELS[item.value]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end sm:col-span-2">
            <Link href={clearFiltersHref} className={`${navButtonClassName} w-full sm:w-auto`}>
              ניקוי סינון
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
