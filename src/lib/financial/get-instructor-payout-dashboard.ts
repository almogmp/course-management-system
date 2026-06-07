import type { MonthView } from "@/components/calendar/month-calendar-utils";
import type { SessionStatus } from "@/components/sessions/constants";
import { getMonthBounds, isSessionInMonth } from "@/lib/dashboard/month-bounds";
import {
  countsAsActualFinancial,
  countsAsPotentialFinancial,
} from "@/lib/financial/status";
import { getTodayDateKey, isDateInRange } from "@/lib/financial/period-bounds";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseServerClient } from "@/lib/supabase/server";

type InstructorPayoutSessionRow = {
  session_date: string;
  instructor_hours: number;
  instructor_hourly_rate: number;
  status: SessionStatus;
};

export type InstructorFinancialPeriodStats = {
  hours: number;
  actualPayout: number;
  potentialPayout: number;
};

export type InstructorPayoutDashboardStats = {
  today: InstructorFinancialPeriodStats;
  month: InstructorFinancialPeriodStats;
};

function payoutForSession(row: InstructorPayoutSessionRow, useActual: boolean): number {
  const amount = row.instructor_hours * row.instructor_hourly_rate;

  if (useActual) {
    return countsAsActualFinancial(row.status) ? amount : 0;
  }

  return countsAsPotentialFinancial(row.status) ? amount : 0;
}

function hoursForSession(row: InstructorPayoutSessionRow): number {
  return countsAsPotentialFinancial(row.status) ? row.instructor_hours : 0;
}

function sumPeriodStats(
  rows: InstructorPayoutSessionRow[],
  startDate: string,
  endDate: string,
): InstructorFinancialPeriodStats {
  return rows.reduce(
    (acc, row) => {
      if (!isDateInRange(row.session_date, startDate, endDate)) {
        return acc;
      }

      return {
        hours: acc.hours + hoursForSession(row),
        actualPayout: acc.actualPayout + payoutForSession(row, true),
        potentialPayout: acc.potentialPayout + payoutForSession(row, false),
      };
    },
    { hours: 0, actualPayout: 0, potentialPayout: 0 },
  );
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
  const month = getMonthBounds(monthView);

  const rangeStart = [month.startDate, today].sort()[0] ?? month.startDate;
  const rangeEnd = [month.endDate, today].sort().at(-1) ?? month.endDate;

  const supabase = await createServerSupabaseClient();
  const rows = await fetchInstructorPayoutSessions(supabase, rangeStart, rangeEnd);

  const monthRows = rows.filter((row) => isSessionInMonth(row.session_date, monthView));

  return {
    today: sumPeriodStats(rows, today, today),
    month: sumPeriodStats(monthRows, month.startDate, month.endDate),
  };
}
