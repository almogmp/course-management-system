import type { MonthView } from "@/components/calendar/month-calendar-utils";
import {
  getFinancialSessionsForMonth,
  getFinancialSessionsInRange,
} from "@/lib/financial/get-financial-sessions";
import { getTodayDateKey } from "@/lib/financial/period-bounds";
import { sumFinancialRecords } from "@/lib/financial/financial-session-record";

export type AdminFinancialPeriodStats = {
  grossRevenue: number;
  vat: number;
  instructorCost: number;
  netProfit: number;
  potentialGrossRevenue: number;
  potentialNetProfit: number;
};

export type AdminFinancialDashboardStats = {
  today: AdminFinancialPeriodStats;
  month: AdminFinancialPeriodStats;
  missingRateSessionCount: number;
};

function periodStatsFromTotals(
  totals: ReturnType<typeof sumFinancialRecords>,
): AdminFinancialPeriodStats {
  return {
    grossRevenue: totals.actualGrossRevenue,
    vat: totals.actualVatAmount,
    instructorCost: totals.actualInstructorPayout,
    netProfit: totals.actualNetProfit,
    potentialGrossRevenue: totals.potentialGrossRevenue,
    potentialNetProfit: totals.potentialNetProfit,
  };
}

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
    today: periodStatsFromTotals(todayTotals),
    month: periodStatsFromTotals(monthTotals),
    missingRateSessionCount,
  };
}
