import type { SessionStatus } from "@/components/sessions/constants";
import { getEffectiveInstructorId } from "@/lib/sessions/instructor-assignment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { PartnerReportFilterOptions } from "@/lib/reports/partner-report-types";

export type PartnerReportSessionRow = {
  id: string;
  session_date: string;
  status: SessionStatus;
  course_name: string;
  company_hours: number;
  instructor_hours: number;
  sessionInstitutionHourlyRate: number | null;
  sessionInstructorHourlyRate: number | null;
  courseCompanyHourlyRate: number | null;
  courseInstructorHourlyWage: number | null;
  instructor_id: string;
  instructor_name: string;
  institution_id: string | null;
  institution_name: string | null;
};

type PartnerSessionQueryRow = Pick<
  Database["public"]["Tables"]["sessions"]["Row"],
  | "id"
  | "session_date"
  | "status"
  | "company_hours"
  | "instructor_hours"
  | "institution_hourly_rate"
  | "instructor_hourly_rate"
  | "substitute_instructor_id"
> & {
  courses: Pick<
    Database["public"]["Tables"]["courses"]["Row"],
    | "id"
    | "name"
    | "institution_id"
    | "lead_instructor_id"
    | "company_hourly_rate"
    | "instructor_hourly_wage"
  > & {
    institutions: Pick<Database["public"]["Tables"]["institutions"]["Row"], "id" | "name"> | null;
  } | null;
};

export async function getPartnerReportFilterOptions(): Promise<PartnerReportFilterOptions> {
  const supabase = await createServerSupabaseClient();

  const [{ data: instructorRows, error: instructorsError }, { data: institutionRows, error: institutionsError }] =
    await Promise.all([
      supabase.from("instructors").select("id, full_name").order("full_name", { ascending: true }),
      supabase.from("institutions").select("id, name").order("name", { ascending: true }),
    ]);

  if (instructorsError) {
    throw new Error(instructorsError.message);
  }

  if (institutionsError) {
    throw new Error(institutionsError.message);
  }

  return {
    instructors: (instructorRows ?? []).map((row) => ({ id: row.id, name: row.full_name })),
    institutions: (institutionRows ?? []).map((row) => ({ id: row.id, name: row.name })),
  };
}

/** Completed sessions in date range with session + course rates for shared resolver. */
export async function getPartnerReportSessions(
  startDate: string,
  endDate: string,
): Promise<PartnerReportSessionRow[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: sessionRows, error: sessionsError }, { data: instructorRows, error: instructorsError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          `id, session_date, status, company_hours, instructor_hours, institution_hourly_rate, instructor_hourly_rate,
           substitute_instructor_id,
           courses(id, name, institution_id, lead_instructor_id, company_hourly_rate, instructor_hourly_wage, institutions(id, name))`,
        )
        .eq("status", "completed")
        .gte("session_date", startDate)
        .lte("session_date", endDate),
      supabase.from("instructors").select("id, full_name"),
    ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (instructorsError) {
    throw new Error(instructorsError.message);
  }

  const instructorNames = new Map(
    (instructorRows ?? []).map((row) => [row.id, row.full_name]),
  );

  const sessions: PartnerReportSessionRow[] = [];

  for (const row of (sessionRows ?? []) as PartnerSessionQueryRow[]) {
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
      session_date: row.session_date,
      status: row.status as SessionStatus,
      course_name: course.name,
      company_hours: row.company_hours,
      instructor_hours: row.instructor_hours,
      sessionInstitutionHourlyRate: row.institution_hourly_rate,
      sessionInstructorHourlyRate: row.instructor_hourly_rate,
      courseCompanyHourlyRate: course.company_hourly_rate,
      courseInstructorHourlyWage: course.instructor_hourly_wage,
      instructor_id: instructorId,
      instructor_name: instructorNames.get(instructorId) ?? "מדריך לא ידוע",
      institution_id: course.institution_id,
      institution_name: course.institutions?.name ?? null,
    });
  }

  return sessions;
}
