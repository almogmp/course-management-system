import type { MonthView } from "@/components/calendar/month-calendar-utils";
import type { CourseStatus } from "@/components/courses/constants";
import type { SessionStatus } from "@/components/sessions/constants";
import { getMonthBounds } from "@/lib/dashboard/month-bounds";
import { getEffectiveInstructorId } from "@/lib/sessions/instructor-assignment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { ReportFilterOptions, ReportSessionRecord } from "@/lib/reports/types";

type ReportSessionQueryRow = Pick<
  Database["public"]["Tables"]["sessions"]["Row"],
  | "id"
  | "status"
  | "instructor_hours"
  | "company_hours"
  | "substitute_instructor_id"
> & {
  courses: Pick<
    Database["public"]["Tables"]["courses"]["Row"],
    "id" | "name" | "status" | "institution_id" | "lead_instructor_id"
  > & {
    institutions: Pick<Database["public"]["Tables"]["institutions"]["Row"], "id" | "name"> | null;
  } | null;
};

export async function getMonthlyReportSessions(
  monthView: MonthView,
): Promise<{ sessions: ReportSessionRecord[]; filterOptions: ReportFilterOptions }> {
  const { startDate, endDate } = getMonthBounds(monthView);
  const supabase = await createServerSupabaseClient();

  const [{ data: sessionRows, error: sessionsError }, { data: instructorRows, error: instructorsError }, { data: institutionRows, error: institutionsError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          `id, status, instructor_hours, company_hours, substitute_instructor_id,
           courses(id, name, status, institution_id, lead_instructor_id, institutions(id, name))`,
        )
        .gte("session_date", startDate)
        .lte("session_date", endDate),
      supabase.from("instructors").select("id, full_name").order("full_name", { ascending: true }),
      supabase.from("institutions").select("id, name").order("name", { ascending: true }),
    ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (instructorsError) {
    throw new Error(instructorsError.message);
  }

  if (institutionsError) {
    throw new Error(institutionsError.message);
  }

  const instructorNames = new Map(
    (instructorRows ?? []).map((instructor) => [instructor.id, instructor.full_name]),
  );

  const sessions: ReportSessionRecord[] = [];

  for (const row of (sessionRows ?? []) as ReportSessionQueryRow[]) {
    const course = row.courses;

    if (!course?.lead_instructor_id) {
      continue;
    }

    const instructorId = getEffectiveInstructorId(
      row.substitute_instructor_id,
      course.lead_instructor_id,
    );

    sessions.push({
      id: row.id,
      status: row.status as SessionStatus,
      instructor_hours: row.instructor_hours,
      company_hours: row.company_hours,
      instructor_id: instructorId,
      instructor_name: instructorNames.get(instructorId) ?? "מדריך לא ידוע",
      institution_id: course.institution_id,
      institution_name: course.institutions?.name ?? null,
      course_id: course.id,
      course_name: course.name,
      course_status: course.status as CourseStatus,
    });
  }

  return {
    sessions,
    filterOptions: {
      instructors: (instructorRows ?? []).map((row) => ({ id: row.id, name: row.full_name })),
      institutions: (institutionRows ?? []).map((row) => ({ id: row.id, name: row.name })),
    },
  };
}
