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
  ReportFinancialSummary,
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

function toReportFinancialSummary(
  totals: ReturnType<typeof sumFinancialRecords>,
): ReportFinancialSummary {
  return {
    actualGrossRevenue: totals.actualGrossRevenue,
    potentialGrossRevenue: totals.potentialGrossRevenue,
    actualVatAmount: totals.actualVatAmount,
    potentialVatAmount: totals.potentialVatAmount,
    actualNetRevenueBeforeInstructor: totals.actualNetRevenueBeforeInstructor,
    potentialNetRevenueBeforeInstructor: totals.potentialNetRevenueBeforeInstructor,
    actualInstructorPayout: totals.actualInstructorPayout,
    potentialInstructorPayout: totals.potentialInstructorPayout,
    actualGrossProfit: totals.actualGrossProfit,
    potentialGrossProfit: totals.potentialGrossProfit,
    actualNetProfit: totals.actualNetProfit,
    potentialNetProfit: totals.potentialNetProfit,
    actualRevenue: totals.actualRevenue,
    potentialRevenue: totals.potentialRevenue,
    actualProfit: totals.actualProfit,
    potentialProfit: totals.potentialProfit,
  };
}

function emptyInstitutionRow(
  institutionId: string,
  institutionName: string,
): InstitutionReportRow {
  return {
    institutionId,
    institutionName,
    sessionCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    instructorHours: 0,
    companyHours: 0,
    actualGrossRevenue: 0,
    potentialGrossRevenue: 0,
    actualVatAmount: 0,
    potentialVatAmount: 0,
    actualNetRevenueBeforeInstructor: 0,
    potentialNetRevenueBeforeInstructor: 0,
    actualInstructorPayout: 0,
    actualGrossProfit: 0,
    potentialGrossProfit: 0,
    actualNetProfit: 0,
    potentialNetProfit: 0,
    actualRevenue: 0,
    potentialRevenue: 0,
    actualProfit: 0,
    potentialProfit: 0,
  };
}

function addFinancialsToInstitutionRow(
  row: InstitutionReportRow,
  financials: FinancialSessionRecord["financials"],
): void {
  row.actualGrossRevenue += financials.actualGrossRevenue;
  row.potentialGrossRevenue += financials.potentialGrossRevenue;
  row.actualVatAmount += financials.actualVatAmount;
  row.potentialVatAmount += financials.potentialVatAmount;
  row.actualNetRevenueBeforeInstructor += financials.actualNetRevenueBeforeInstructor;
  row.potentialNetRevenueBeforeInstructor += financials.potentialNetRevenueBeforeInstructor;
  row.actualInstructorPayout += financials.actualInstructorPayout;
  row.actualGrossProfit += financials.actualGrossProfit;
  row.potentialGrossProfit += financials.potentialGrossProfit;
  row.actualNetProfit += financials.actualNetProfit;
  row.potentialNetProfit += financials.potentialNetProfit;
  row.actualRevenue += financials.actualRevenue;
  row.potentialRevenue += financials.potentialRevenue;
  row.actualProfit += financials.actualProfit;
  row.potentialProfit += financials.potentialProfit;
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
      financial: toReportFinancialSummary(financialTotals),
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

    const existing =
      byInstitution.get(institutionId) ?? emptyInstitutionRow(institutionId, institutionName);

    existing.sessionCount += 1;
    existing.instructorHours += record.instructor_hours;
    existing.companyHours += record.company_hours;
    addFinancialsToInstitutionRow(existing, record.financials);

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
      actualGrossRevenue: 0,
      potentialGrossRevenue: 0,
      actualVatAmount: 0,
      actualNetRevenueBeforeInstructor: 0,
      actualInstructorPayout: 0,
      actualGrossProfit: 0,
      actualNetProfit: 0,
      actualRevenue: 0,
      potentialRevenue: 0,
      actualProfit: 0,
    };

    existing.sessionCount += 1;
    existing.instructorHours += record.instructor_hours;
    existing.companyHours += record.company_hours;
    existing.actualGrossRevenue += record.financials.actualGrossRevenue;
    existing.potentialGrossRevenue += record.financials.potentialGrossRevenue;
    existing.actualVatAmount += record.financials.actualVatAmount;
    existing.actualNetRevenueBeforeInstructor += record.financials.actualNetRevenueBeforeInstructor;
    existing.actualInstructorPayout += record.financials.actualInstructorPayout;
    existing.actualGrossProfit += record.financials.actualGrossProfit;
    existing.actualNetProfit += record.financials.actualNetProfit;
    existing.actualRevenue += record.financials.actualRevenue;
    existing.potentialRevenue += record.financials.potentialRevenue;
    existing.actualProfit += record.financials.actualProfit;

    byCourse.set(record.course_id, existing);
  }

  return Array.from(byCourse.values()).sort((a, b) => b.sessionCount - a.sessionCount);
}
