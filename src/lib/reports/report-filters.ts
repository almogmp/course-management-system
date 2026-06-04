import type { SessionStatus } from "@/components/sessions/constants";
import type { ReportSearchParams } from "@/lib/reports/report-url";
import type { ReportSessionRecord } from "@/lib/reports/types";

export type ReportFilters = {
  instructorId?: string;
  institutionId?: string;
  status?: SessionStatus;
};

export function parseReportFilters(searchParams?: ReportSearchParams): ReportFilters {
  return {
    instructorId: searchParams?.filterInstructor || undefined,
    institutionId: searchParams?.filterInstitution || undefined,
  };
}

export function applyReportFilters(
  sessions: ReportSessionRecord[],
  filters: ReportFilters,
): ReportSessionRecord[] {
  return sessions.filter((session) => {
    if (filters.instructorId && session.instructor_id !== filters.instructorId) {
      return false;
    }

    if (filters.institutionId && session.institution_id !== filters.institutionId) {
      return false;
    }

    if (filters.status && session.status !== filters.status) {
      return false;
    }

    return true;
  });
}
