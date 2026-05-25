import type { MonthView } from "@/components/calendar/month-calendar-utils";
import {
  getFinancialSessionsForMonth,
  getFinancialSessionsInRange,
} from "@/lib/financial/get-financial-sessions";
import { getTodayDateKey } from "@/lib/financial/period-bounds";
import { sumFinancialRecords } from "@/lib/financial/financial-session-record";

export type AdminFinancialDashboardStats = {
  todayActualGrossRevenue: number;
  todayPotentialGrossRevenue: number;
  monthActualNetProfit: number;
  monthPotentialNetProfit: number;
  monthActualGrossProfit: number;
  monthPotentialGrossProfit: number;
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
    todayActualGrossRevenue: todayTotals.actualGrossRevenue,
    todayPotentialGrossRevenue: todayTotals.potentialGrossRevenue,
    monthActualNetProfit: monthTotals.actualNetProfit,
    monthPotentialNetProfit: monthTotals.potentialNetProfit,
    monthActualGrossProfit: monthTotals.actualGrossProfit,
    monthPotentialGrossProfit: monthTotals.potentialGrossProfit,
    monthActualInstructorPayout: monthTotals.actualInstructorPayout,
    monthPotentialInstructorPayout: monthTotals.potentialInstructorPayout,
    missingRateSessionCount,
  };
}
