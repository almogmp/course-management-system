import Link from "next/link";

import {
  DashboardCalendarControls,
  type DashboardCalendarView,
} from "@/components/dashboard/dashboard-calendar-controls";
import { getMonthlySessions, formatMonthLabel } from "@/components/calendar/get-monthly-sessions";
import { getCalendarFilterOptions, getWeeklySessions } from "@/components/calendar/get-weekly-sessions";
import { MonthlyCalendar } from "@/components/calendar/monthly-calendar";
import { WeeklyCalendar } from "@/components/calendar/weekly-calendar";
import { parseMonthParam } from "@/components/calendar/month-calendar-utils";
import type { MonthView } from "@/components/calendar/month-calendar-utils";
import { InlineErrorPanel } from "@/components/ui/inline-error-panel";
import {
  applyCalendarFilters,
  parseCalendarFilters,
} from "@/lib/calendar/calendar-filters";
import type { DashboardSearchParams } from "@/lib/dashboard/dashboard-url";
import { formatWeekRangeLabel, parseWeekStartParam } from "@/lib/date/week";
import { enrichDateKeysWithHebrew, enrichWeekDays } from "@/lib/calendar/hebrew-calendar";
import { getSafeErrorMessage, logServerError } from "@/lib/errors/safe-error-message";

type DashboardCalendarSectionProps = {
  isAdmin: boolean;
  searchParams?: DashboardSearchParams;
};

function parseCalendarView(value: string | undefined): DashboardCalendarView {
  return value === "monthly" ? "monthly" : "weekly";
}

function resolveCalendarContext(
  searchParams?: DashboardSearchParams,
): { weekStart: string; monthView: MonthView } {
  const monthView = parseMonthParam(searchParams?.month);
  const weekStart = parseWeekStartParam(searchParams?.week);

  return { weekStart, monthView };
}

async function DashboardCalendarSectionContent({
  isAdmin,
  searchParams,
}: DashboardCalendarSectionProps) {
  const view = parseCalendarView(searchParams?.calendarView);
  const { weekStart, monthView } = resolveCalendarContext(searchParams);
  const filters = parseCalendarFilters(searchParams);
  const filterOptions = await getCalendarFilterOptions(isAdmin);

  const scopeLabel = isAdmin ? "כל המפגשים" : "המפגשים שלי";

  if (view === "monthly") {
    const { calendarDays, sessions: rawSessions } = await getMonthlySessions(isAdmin, monthView);
    const sessions = applyCalendarFilters(rawSessions, filters);
    const hebrewByDate = enrichDateKeysWithHebrew(calendarDays.map((day) => day.dateKey));
    const enrichedCalendarDays = calendarDays.map((day) => ({
      ...day,
      ...hebrewByDate[day.dateKey],
    }));
    const monthLabel = formatMonthLabel(monthView);

    return (
      <section aria-labelledby="dashboard-calendar-heading" className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-1 text-start">
            <h2
              id="dashboard-calendar-heading"
              className="text-xl font-bold text-foreground sm:text-2xl"
            >
              יומן
            </h2>
            <p className="text-sm text-muted-foreground">
              {monthLabel} · {scopeLabel} · {sessions.length} מפגשים מוצגים
            </p>
          </div>

          <DashboardCalendarControls
            view={view}
            weekStart={weekStart}
            monthView={monthView}
            searchParams={searchParams}
            filterOptions={filterOptions}
            isAdmin={isAdmin}
          />
        </div>

        {isAdmin ? (
          <div className="flex flex-wrap gap-2 text-start">
            <Link
              href="/sessions"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              לניהול כל המפגשים
            </Link>
            <Link
              href="/courses"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              לניהול קורסים
            </Link>
          </div>
        ) : null}

        <MonthlyCalendar calendarDays={enrichedCalendarDays} sessions={sessions} />
      </section>
    );
  }

  const { weekRange, sessions: rawSessions } = await getWeeklySessions(isAdmin, weekStart);
  const sessions = applyCalendarFilters(rawSessions, filters);
  const enrichedWeekDays = enrichWeekDays(weekRange.days);

  return (
    <section aria-labelledby="dashboard-calendar-heading" className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 space-y-1 text-start">
          <h2
            id="dashboard-calendar-heading"
            className="text-xl font-bold text-foreground sm:text-2xl"
          >
            יומן
          </h2>
          <p className="text-sm text-muted-foreground">
            {formatWeekRangeLabel(weekRange.startDate, weekRange.endDate)} · {scopeLabel} ·{" "}
            {sessions.length} מפגשים מוצגים
          </p>
        </div>

        <DashboardCalendarControls
          view={view}
          weekStart={weekStart}
          monthView={monthView}
          searchParams={searchParams}
          filterOptions={filterOptions}
          isAdmin={isAdmin}
        />
      </div>

      {isAdmin ? (
        <div className="flex flex-wrap gap-2 text-start">
          <Link
            href="/sessions"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            לניהול כל המפגשים
          </Link>
          <Link
            href="/courses"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            לניהול קורסים
          </Link>
        </div>
      ) : null}

      <WeeklyCalendar weekDays={enrichedWeekDays} sessions={sessions} />
    </section>
  );
}

export async function DashboardCalendarSection(props: DashboardCalendarSectionProps) {
  try {
    return await DashboardCalendarSectionContent(props);
  } catch (error) {
    logServerError("DashboardCalendarSection", error);

    return (
      <InlineErrorPanel
        title="לא ניתן לטעון את היומן"
        message={getSafeErrorMessage(error, "לא ניתן לטעון את המפגשים ביומן כרגע.")}
        retryHref="/dashboard"
      />
    );
  }
}
