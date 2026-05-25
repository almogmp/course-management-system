import {
  aggregateInstructorWorkload,
  computeMonthlyOverview,
} from "@/lib/dashboard/workload";
import type { FinancialSessionRecord } from "@/lib/financial/financial-session-record";
import { sumFinancialRecords } from "@/lib/financial/financial-session-record";
import type {
  CourseReportRow,
  InstitutionReportRow,
  InstructorReportRow,
  MonthlyReportData,
  ReportSessionRecord,
} from "@/lib/reports/types";

function toReportSessionRecord(record: FinancialSessionRecord): ReportSessionRecord {
  return {
    id: record.id,
    status: record.status,
    instructor_hours: record.instructor_hours,
    company_hours: record.company_hours,
    instructor_id: record.instructor_id,
    instructor_name: record.instructor_name,
    institution_id: record.institution_id,
    institution_name: record.institution_name,
    course_id: record.course_id,
    course_name: record.course_name,
    course_status: "active",
  };
}

export function buildMonthlyReportDataFromFinancial(
  records: FinancialSessionRecord[],
): MonthlyReportData {
  const sessions = records.map(toReportSessionRecord);
  const overview = computeMonthlyOverview(sessions);
  const financialTotals = sumFinancialRecords(records);

  const workloadEntries = records.map((record) => ({
    instructorId: record.instructor_id,
    instructorName: record.instructor_name,
    session: {
      status: record.status,
      instructor_hours: record.instructor_hours,
      company_hours: record.company_hours,
    },
    financials: record.financials,
  }));

  const workloadRows = aggregateInstructorWorkload(workloadEntries);

  const instructorRows: InstructorReportRow[] = workloadRows.map((row) => {
    const instructorRecords = records.filter((record) => record.instructor_id === row.instructorId);
    const totals = sumFinancialRecords(instructorRecords);

    return {
      ...row,
      actualInstructorPayout: totals.actualInstructorPayout,
      potentialInstructorPayout: totals.potentialInstructorPayout,
    };
  });

  const institutionRows = aggregateInstitutionFinancial(records);
  const courseRows = aggregateCourseFinancial(records);

  return {
    summary: {
      totalSessions: sessions.length,
      completedCount: overview.completedCount,
      cancelledCount: overview.cancelledCount,
      instructorHours: overview.instructorHours,
      companyHours: overview.companyHours,
      financial: {
        actualRevenue: financialTotals.actualRevenue,
        potentialRevenue: financialTotals.potentialRevenue,
        actualInstructorPayout: financialTotals.actualInstructorPayout,
        potentialInstructorPayout: financialTotals.potentialInstructorPayout,
        actualProfit: financialTotals.actualProfit,
        potentialProfit: financialTotals.potentialProfit,
      },
    },
    instructorRows,
    institutionRows,
    courseRows,
  };
}

function aggregateInstitutionFinancial(
  records: FinancialSessionRecord[],
): InstitutionReportRow[] {
  const byInstitution = new Map<string, InstitutionReportRow>();

  for (const record of records) {
    const institutionId = record.institution_id ?? "unknown";
    const institutionName = record.institution_name ?? "ללא מוסד";

    const existing = byInstitution.get(institutionId) ?? {
      institutionId,
      institutionName,
      sessionCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      instructorHours: 0,
      companyHours: 0,
      actualRevenue: 0,
      potentialRevenue: 0,
      actualProfit: 0,
      potentialProfit: 0,
    };

    existing.sessionCount += 1;
    existing.instructorHours += record.instructor_hours;
    existing.companyHours += record.company_hours;
    existing.actualRevenue += record.financials.actualRevenue;
    existing.potentialRevenue += record.financials.potentialRevenue;
    existing.actualProfit += record.financials.actualProfit;
    existing.potentialProfit += record.financials.potentialProfit;

    if (record.status === "completed") {
      existing.completedCount += 1;
    }

    if (record.status === "cancelled") {
      existing.cancelledCount += 1;
    }

    byInstitution.set(institutionId, existing);
  }

  return Array.from(byInstitution.values()).sort((a, b) => b.sessionCount - a.sessionCount);
}

function aggregateCourseFinancial(records: FinancialSessionRecord[]): CourseReportRow[] {
  const byCourse = new Map<string, CourseReportRow>();

  for (const record of records) {
    const existing = byCourse.get(record.course_id) ?? {
      courseId: record.course_id,
      courseName: record.course_name,
      institutionName: record.institution_name,
      instructorName: record.instructor_name,
      sessionCount: 0,
      instructorHours: 0,
      companyHours: 0,
      courseStatus: "active" as const,
      actualRevenue: 0,
      potentialRevenue: 0,
      actualInstructorPayout: 0,
      actualProfit: 0,
    };

    existing.sessionCount += 1;
    existing.instructorHours += record.instructor_hours;
    existing.companyHours += record.company_hours;
    existing.actualRevenue += record.financials.actualRevenue;
    existing.potentialRevenue += record.financials.potentialRevenue;
    existing.actualInstructorPayout += record.financials.actualInstructorPayout;
    existing.actualProfit += record.financials.actualProfit;

    byCourse.set(record.course_id, existing);
  }

  return Array.from(byCourse.values()).sort((a, b) => b.sessionCount - a.sessionCount);
}
