import type { SessionStatus } from "@/components/sessions/constants";
import {
  computeSessionFinancialsFromParts,
  courseRatesFromDb,
  sessionOverridesFromDb,
} from "@/lib/financial/session-financials";
import { countsAsActualFinancial } from "@/lib/financial/status";

export type SessionSummarySourceRow = {
  status: SessionStatus;
  instructor_hours: number;
  company_hours: number;
  course: {
    company_hourly_rate: number;
    instructor_hourly_wage: number;
  };
  session: {
    institution_hourly_rate: number | null;
    instructor_hourly_rate: number | null;
  };
};

export type SessionsMonthSummary = {
  totalSessions: number;
  totalInstructorHours: number;
  totalCompanyHours: number;
  completedCount: number;
  plannedCount: number;
  activeCount: number;
  cancelledCount: number;
  deferredCount: number;
  totalGrossRevenue?: number;
  totalVat?: number;
  totalNetRevenue?: number;
  totalInstructorPayout?: number;
  totalGrossProfit?: number;
  totalNetProfit?: number;
};

function isActiveStatus(status: SessionStatus): boolean {
  return status === "arrived" || status === "in_progress";
}

export function computeSessionsMonthSummary(
  rows: SessionSummarySourceRow[],
  options: { includeFinancials: boolean },
): SessionsMonthSummary {
  const summary: SessionsMonthSummary = {
    totalSessions: rows.length,
    totalInstructorHours: 0,
    totalCompanyHours: 0,
    completedCount: 0,
    plannedCount: 0,
    activeCount: 0,
    cancelledCount: 0,
    deferredCount: 0,
  };

  if (options.includeFinancials) {
    summary.totalGrossRevenue = 0;
    summary.totalVat = 0;
    summary.totalNetRevenue = 0;
    summary.totalInstructorPayout = 0;
    summary.totalGrossProfit = 0;
    summary.totalNetProfit = 0;
  }

  for (const row of rows) {
    if (row.status === "completed") {
      summary.completedCount += 1;
    } else if (row.status === "planned") {
      summary.plannedCount += 1;
    } else if (isActiveStatus(row.status)) {
      summary.activeCount += 1;
    } else if (row.status === "cancelled") {
      summary.cancelledCount += 1;
    } else if (row.status === "deferred") {
      summary.deferredCount += 1;
    }

    if (row.status === "cancelled") {
      continue;
    }

    summary.totalInstructorHours += row.instructor_hours;
    summary.totalCompanyHours += row.company_hours;

    if (!options.includeFinancials) {
      continue;
    }

    const financials = computeSessionFinancialsFromParts(
      {
        status: row.status,
        instructor_hours: row.instructor_hours,
        company_hours: row.company_hours,
      },
      courseRatesFromDb(row.course),
      sessionOverridesFromDb(row.session),
    );

    if (countsAsActualFinancial(row.status)) {
      summary.totalGrossRevenue! += financials.actualGrossRevenue;
      summary.totalVat! += financials.actualVatAmount;
      summary.totalNetRevenue! += financials.actualNetRevenueBeforeInstructor;
      summary.totalInstructorPayout! += financials.actualInstructorPayout;
      summary.totalGrossProfit! += financials.actualGrossProfit;
      summary.totalNetProfit! += financials.actualNetProfit;
    }
  }

  return summary;
}
