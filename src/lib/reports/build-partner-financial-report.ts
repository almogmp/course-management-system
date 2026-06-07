import {
  computePartnerSessionMoney,
  sumPartnerReportMoney,
} from "@/lib/financial/partner-report-engine";
import { resolveSessionRates } from "@/lib/financial/resolve-session-rates";
import { roundMoney } from "@/lib/financial/round-money";
import type { PartnerReportSessionRow } from "@/lib/reports/get-partner-report-sessions";
import type {
  PartnerFinancialReport,
  PartnerReportDateRange,
  PartnerReportEntityRow,
  PartnerReportRateAudit,
} from "@/lib/reports/partner-report-types";

function emptyEntityRow(id: string, name: string): PartnerReportEntityRow {
  return {
    id,
    name,
    completedSessionCount: 0,
    totalHours: 0,
    grossRevenue: 0,
    vat: 0,
    instructorCost: 0,
    grossProfit: 0,
  };
}

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

function buildRateAudit(sessions: PartnerReportSessionRow[]): PartnerReportRateAudit {
  const audit: PartnerReportRateAudit = {
    missingCompanyRateSessionCount: 0,
    missingInstructorRateSessionCount: 0,
    sessionLevelCompanyRateCount: 0,
    courseFallbackCompanyRateCount: 0,
    sessionLevelInstructorRateCount: 0,
    courseFallbackInstructorRateCount: 0,
  };

  for (const session of sessions) {
    const rates = resolveSessionRates(sessionFinancialInput(session));

    if (session.company_hours > 0 && rates.missingCompanyRate) {
      audit.missingCompanyRateSessionCount += 1;
    }

    if (session.instructor_hours > 0 && rates.missingInstructorRate) {
      audit.missingInstructorRateSessionCount += 1;
    }

    if (rates.companyRateSource === "session") {
      audit.sessionLevelCompanyRateCount += 1;
    } else if (rates.companyRateSource === "course") {
      audit.courseFallbackCompanyRateCount += 1;
    }

    if (rates.instructorRateSource === "session") {
      audit.sessionLevelInstructorRateCount += 1;
    } else if (rates.instructorRateSource === "course") {
      audit.courseFallbackInstructorRateCount += 1;
    }
  }

  return audit;
}

function aggregateByKey(
  sessions: PartnerReportSessionRow[],
  keyFn: (session: PartnerReportSessionRow) => { id: string; name: string },
): PartnerReportEntityRow[] {
  const byKey = new Map<string, PartnerReportEntityRow>();

  for (const session of sessions) {
    const { id, name } = keyFn(session);
    const row = byKey.get(id) ?? emptyEntityRow(id, name);
    const money = computePartnerSessionMoney(sessionFinancialInput(session));

    row.completedSessionCount += 1;
    row.totalHours += session.instructor_hours;
    row.grossRevenue += money.grossRevenue;
    row.vat += money.vat;
    row.instructorCost += money.instructorCost;
    row.grossProfit += money.grossProfit;

    row.grossRevenue = roundMoney(row.grossRevenue);
    row.vat = roundMoney(row.vat);
    row.instructorCost = roundMoney(row.instructorCost);
    row.grossProfit = roundMoney(row.grossProfit);

    byKey.set(id, row);
  }

  return Array.from(byKey.values()).sort((a, b) => b.grossRevenue - a.grossRevenue);
}

export function buildPartnerFinancialReport(
  dateRange: PartnerReportDateRange,
  sessions: PartnerReportSessionRow[],
): PartnerFinancialReport {
  const sessionMoney = sessions.map((session) =>
    computePartnerSessionMoney(sessionFinancialInput(session)),
  );

  const totalsMoney = sumPartnerReportMoney(sessionMoney);
  const totalHours = sessions.reduce((sum, row) => sum + row.instructor_hours, 0);

  const instructorRows = aggregateByKey(sessions, (session) => ({
    id: session.instructor_id,
    name: session.instructor_name,
  }));

  const institutionRows = aggregateByKey(sessions, (session) => ({
    id: session.institution_id ?? "unknown",
    name: session.institution_name ?? "ללא מוסד",
  }));

  return {
    dateRange,
    totals: {
      completedSessionCount: sessions.length,
      totalHours,
      ...totalsMoney,
    },
    rateAudit: buildRateAudit(sessions),
    instructorRows,
    institutionRows,
  };
}
