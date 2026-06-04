import {
  computePartnerSessionMoney,
  sumPartnerReportMoney,
} from "@/lib/financial/partner-report-engine";
import { roundMoney } from "@/lib/financial/round-money";
import type { PartnerReportSessionRow } from "@/lib/reports/get-partner-report-sessions";
import type {
  PartnerFinancialReport,
  PartnerReportDateRange,
  PartnerReportEntityRow,
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

function aggregateByKey(
  sessions: PartnerReportSessionRow[],
  keyFn: (session: PartnerReportSessionRow) => { id: string; name: string },
): PartnerReportEntityRow[] {
  const byKey = new Map<string, PartnerReportEntityRow>();

  for (const session of sessions) {
    const { id, name } = keyFn(session);
    const row = byKey.get(id) ?? emptyEntityRow(id, name);
    const money = computePartnerSessionMoney({
      instructor_hours: session.instructor_hours,
      company_hourly_rate: session.company_hourly_rate,
      instructor_hourly_rate: session.instructor_hourly_rate,
    });

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
    computePartnerSessionMoney({
      instructor_hours: session.instructor_hours,
      company_hourly_rate: session.company_hourly_rate,
      instructor_hourly_rate: session.instructor_hourly_rate,
    }),
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
    instructorRows,
    institutionRows,
  };
}
