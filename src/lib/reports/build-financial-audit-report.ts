import { computeCompletedSessionMoney } from "@/lib/financial/resolve-session-rates";
import type { RateSource } from "@/lib/financial/resolve-session-rates";
import type { PartnerReportSessionRow } from "@/lib/reports/get-partner-report-sessions";
import type { PartnerReportDateRange } from "@/lib/reports/partner-report-types";

export type FinancialAuditSessionRow = {
  sessionId: string;
  courseName: string;
  institutionName: string;
  sessionDate: string;
  companyHours: number;
  instructorHours: number;
  companyRate: number;
  instructorRate: number;
  companyRateSource: RateSource;
  instructorRateSource: RateSource;
  grossRevenue: number;
  instructorCost: number;
  vat: number;
  grossProfit: number;
  missingCompanyRate: boolean;
  missingInstructorRate: boolean;
};

export type FinancialAuditReport = {
  dateRange: PartnerReportDateRange;
  rows: FinancialAuditSessionRow[];
};

function sessionFinancialInput(session: PartnerReportSessionRow) {
  return {
    company_hours: session.company_hours,
    instructor_hours: session.instructor_hours,
    sessionInstitutionHourlyRate: session.sessionInstitutionHourlyRate,
    sessionInstructorHourlyRate: session.sessionInstructorHourlyRate,
    courseCompanyHourlyRate: session.courseCompanyHourlyRate,
    courseInstructorHourlyWage: session.courseInstructorHourlyWage,
  };
}

export function buildFinancialAuditReport(
  dateRange: PartnerReportDateRange,
  sessions: PartnerReportSessionRow[],
): FinancialAuditReport {
  const rows = sessions
    .map((session): FinancialAuditSessionRow => {
      const result = computeCompletedSessionMoney(sessionFinancialInput(session));

      return {
        sessionId: session.id,
        courseName: session.course_name,
        institutionName: session.institution_name ?? "ללא מוסד",
        sessionDate: session.session_date,
        companyHours: session.company_hours,
        instructorHours: session.instructor_hours,
        companyRate: result.rates.companyRate,
        instructorRate: result.rates.instructorRate,
        companyRateSource: result.rates.companyRateSource,
        instructorRateSource: result.rates.instructorRateSource,
        grossRevenue: result.grossRevenue,
        instructorCost: result.instructorCost,
        vat: result.vat,
        grossProfit: result.grossProfit,
        missingCompanyRate: result.rates.missingCompanyRate,
        missingInstructorRate: result.rates.missingInstructorRate,
      };
    })
    .sort((a, b) => {
      if (a.sessionDate !== b.sessionDate) {
        return a.sessionDate.localeCompare(b.sessionDate);
      }

      return a.courseName.localeCompare(b.courseName, "he");
    });

  return { dateRange, rows };
}
