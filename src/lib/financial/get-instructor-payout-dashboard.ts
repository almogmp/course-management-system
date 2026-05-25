import type { MonthView } from "@/components/calendar/month-calendar-utils";
import type { SessionStatus } from "@/components/sessions/constants";
import { getMonthBounds, isSessionInMonth } from "@/lib/dashboard/month-bounds";
import {
  countsAsActualFinancial,
  countsAsPotentialFinancial,
} from "@/lib/financial/status";
import {
  getTodayDateKey,
  getWeekBoundsForDate,
  isDateInRange,
} from "@/lib/financial/period-bounds";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseServerClient } from "@/lib/supabase/server";

type InstructorPayoutSessionRow = {
  session_date: string;
  instructor_hours: number;
  instructor_hourly_rate: number;
  status: SessionStatus;
};

export type InstructorPayoutDashboardStats = {
  todayActualPayout: number;
  todayPotentialPayout: number;
  weekActualPayout: number;
  weekPotentialPayout: number;
  monthActualPayout: number;
  monthPotentialPayout: number;
};

function payoutForSession(row: InstructorPayoutSessionRow, useActual: boolean): number {
  const amount = row.instructor_hours * row.instructor_hourly_rate;

  if (useActual) {
    return countsAsActualFinancial(row.status) ? amount : 0;
  }

  return countsAsPotentialFinancial(row.status) ? amount : 0;
}

function sumPayout(
  rows: InstructorPayoutSessionRow[],
  startDate: string,
  endDate: string,
  useActual: boolean,
): number {
  return rows.reduce((sum, row) => {
    if (!isDateInRange(row.session_date, startDate, endDate)) {
      return sum;
    }

    return sum + payoutForSession(row, useActual);
  }, 0);
}

async function fetchInstructorPayoutSessions(
  supabase: SupabaseServerClient,
  startDate: string,
  endDate: string,
): Promise<InstructorPayoutSessionRow[]> {
  const instructorClient = supabase as unknown as SupabaseServerClient & {
    from: (relation: string) => ReturnType<SupabaseServerClient["from"]>;
  };

  const { data, error } = await instructorClient
    .from("instructor_sessions")
    .select("session_date, instructor_hours, instructor_hourly_rate, status")
    .gte("session_date", startDate)
    .lte("session_date", endDate);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as InstructorPayoutSessionRow[];
}

export async function getInstructorPayoutDashboard(
  monthView: MonthView,
): Promise<InstructorPayoutDashboardStats> {
  const today = getTodayDateKey();
  const week = getWeekBoundsForDate(today);
  const month = getMonthBounds(monthView);

  const rangeStart =
    [week.startDate, month.startDate, today].sort()[0] ?? month.startDate;
  const rangeEnd =
    [week.endDate, month.endDate, today].sort().at(-1) ?? month.endDate;

  const supabase = await createServerSupabaseClient();
  const rows = await fetchInstructorPayoutSessions(supabase, rangeStart, rangeEnd);

  const monthRows = rows.filter((row) => isSessionInMonth(row.session_date, monthView));

  return {
    todayActualPayout: sumPayout(rows, today, today, true),
    todayPotentialPayout: sumPayout(rows, today, today, false),
    weekActualPayout: sumPayout(rows, week.startDate, week.endDate, true),
    weekPotentialPayout: sumPayout(rows, week.startDate, week.endDate, false),
    monthActualPayout: sumPayout(monthRows, month.startDate, month.endDate, true),
    monthPotentialPayout: sumPayout(monthRows, month.startDate, month.endDate, false),
  };
}
