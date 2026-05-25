import type { MonthView } from "@/components/calendar/month-calendar-utils";
import {
  getFinancialSessionsForMonth,
  getFinancialSessionsInRange,
} from "@/lib/financial/get-financial-sessions";
import { getTodayDateKey } from "@/lib/financial/period-bounds";
import { sumFinancialRecords } from "@/lib/financial/financial-session-record";

export type AdminFinancialDashboardStats = {
  todayActualRevenue: number;
  todayPotentialRevenue: number;
  monthActualProfit: number;
  monthPotentialProfit: number;
  monthActualInstructorPayout: number;
  monthPotentialInstructorPayout: number;
  missingRateSessionCount: number;
};

export async function getAdminFinancialDashboard(
  monthView: MonthView,
): Promise<AdminFinancialDashboardStats> {
  const today = getTodayDateKey();
  const [todaySessions, monthSessions] = await Promise.all([
    getFinancialSessionsInRange(today, today),
    getFinancialSessionsForMonth(monthView),
  ]);

  const todayTotals = sumFinancialRecords(todaySessions);
  const monthTotals = sumFinancialRecords(monthSessions);

  const missingRateSessionCount = monthSessions.filter(
    (session) =>
      session.financials.missingInstitutionRate || session.financials.missingInstructorRate,
  ).length;

  return {
    todayActualRevenue: todayTotals.actualRevenue,
    todayPotentialRevenue: todayTotals.potentialRevenue,
    monthActualProfit: monthTotals.actualProfit,
    monthPotentialProfit: monthTotals.potentialProfit,
    monthActualInstructorPayout: monthTotals.actualInstructorPayout,
    monthPotentialInstructorPayout: monthTotals.potentialInstructorPayout,
    missingRateSessionCount,
  };
}
