import type { CourseStatus } from "@/components/courses/constants";
import {
  aggregateInstructorWorkload,
  computeMonthlyOverview,
  type InstructorWorkloadRow,
} from "@/lib/dashboard/workload";
import type {
  CourseReportRow,
  InstitutionReportRow,
  MonthlyReportData,
  ReportSessionRecord,
  ReportSummary,
} from "@/lib/reports/types";

const EMPTY_FINANCIAL_SUMMARY = {
  actualGrossRevenue: 0,
  potentialGrossRevenue: 0,
  actualVatAmount: 0,
  potentialVatAmount: 0,
  actualNetRevenueBeforeInstructor: 0,
  potentialNetRevenueBeforeInstructor: 0,
  actualInstructorPayout: 0,
  potentialInstructorPayout: 0,
  actualGrossProfit: 0,
  potentialGrossProfit: 0,
  actualNetProfit: 0,
  potentialNetProfit: 0,
  actualRevenue: 0,
  potentialRevenue: 0,
  actualProfit: 0,
  potentialProfit: 0,
};

export function computeReportSummary(sessions: ReportSessionRecord[]): ReportSummary {
  const overview = computeMonthlyOverview(sessions);

  return {
    totalSessions: sessions.length,
    completedCount: overview.completedCount,
    cancelledCount: overview.cancelledCount,
    instructorHours: overview.instructorHours,
    companyHours: overview.companyHours,
    financial: { ...EMPTY_FINANCIAL_SUMMARY },
  };
}

export function aggregateInstitutionReport(
  sessions: ReportSessionRecord[],
): InstitutionReportRow[] {
  const byInstitution = new Map<string, InstitutionReportRow>();

  for (const session of sessions) {
    const institutionId = session.institution_id ?? "unknown";
    const institutionName = session.institution_name ?? "ללא מוסד";

    const existing =
      byInstitution.get(institutionId) ??
      ({
        institutionId,
        institutionName,
        sessionCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        instructorHours: 0,
        companyHours: 0,
        ...EMPTY_FINANCIAL_SUMMARY,
      } satisfies InstitutionReportRow);

    existing.sessionCount += 1;
    existing.instructorHours += session.instructor_hours;
    existing.companyHours += session.company_hours;

    if (session.status === "completed") {
      existing.completedCount += 1;
    }

    if (session.status === "cancelled") {
      existing.cancelledCount += 1;
    }

    byInstitution.set(institutionId, existing);
  }

  return Array.from(byInstitution.values()).sort((a, b) => b.sessionCount - a.sessionCount);
}

export function aggregateCourseReport(sessions: ReportSessionRecord[]): CourseReportRow[] {
  const byCourse = new Map<string, CourseReportRow & { courseStatus: CourseStatus }>();

  for (const session of sessions) {
    const existing =
      byCourse.get(session.course_id) ??
      ({
        courseId: session.course_id,
        courseName: session.course_name,
        institutionName: session.institution_name,
        instructorName: session.instructor_name,
        sessionCount: 0,
        instructorHours: 0,
        companyHours: 0,
        courseStatus: session.course_status,
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
      } satisfies CourseReportRow & { courseStatus: CourseStatus });

    existing.sessionCount += 1;
    existing.instructorHours += session.instructor_hours;
    existing.companyHours += session.company_hours;

    byCourse.set(session.course_id, existing);
  }

  return Array.from(byCourse.values()).sort((a, b) => b.sessionCount - a.sessionCount);
}

export function buildMonthlyReportData(sessions: ReportSessionRecord[]): MonthlyReportData {
  const workloadEntries = sessions.map((session) => ({
    instructorId: session.instructor_id,
    instructorName: session.instructor_name,
    session: {
      status: session.status,
      instructor_hours: session.instructor_hours,
      company_hours: session.company_hours,
    },
  }));

  const instructorRows: InstructorWorkloadRow[] = aggregateInstructorWorkload(workloadEntries);

  const instructorReportRows = instructorRows.map((row) => ({
    ...row,
    actualInstructorPayout: 0,
    potentialInstructorPayout: 0,
  }));

  return {
    summary: computeReportSummary(sessions),
    instructorRows: instructorReportRows,
    institutionRows: aggregateInstitutionReport(sessions),
    courseRows: aggregateCourseReport(sessions),
  };
}
