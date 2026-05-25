import type { SessionStatus } from "@/components/sessions/constants";
import { resolveSessionSubstituteInstructorId } from "@/lib/sessions/instructor-assignment";
import type { Database } from "@/types/database";

type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];

export type BuildSessionInsertParams = {
  courseId: string;
  schoolYear: string;
  leadInstructorId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  instructorHours: number;
  companyHours: number;
  status: SessionStatus;
  assignedInstructorId: string;
  institutionHourlyRate: number | null;
  instructorHourlyRate: number | null;
  seriesId?: string | null;
  notes?: string;
};

export function buildSessionInsert(params: BuildSessionInsertParams): SessionInsert {
  const notes = params.notes?.trim() ?? "";
  const status = params.status;

  return {
    course_id: params.courseId,
    session_date: params.sessionDate,
    start_time: params.startTime,
    end_time: params.endTime,
    instructor_hours: params.instructorHours,
    company_hours: params.companyHours,
    status,
    school_year: params.schoolYear,
    admin_note: notes || null,
    cancellation_reason: status === "cancelled" || status === "deferred" ? notes : null,
    substitute_instructor_id: resolveSessionSubstituteInstructorId(
      params.assignedInstructorId,
      params.leadInstructorId,
    ),
    institution_hourly_rate: params.institutionHourlyRate,
    instructor_hourly_rate: params.instructorHourlyRate,
    series_id: params.seriesId ?? null,
  };
}
