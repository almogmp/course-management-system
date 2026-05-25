import type { MonthView } from "@/components/calendar/month-calendar-utils";
import type { SessionStatus } from "@/components/sessions/constants";
import { getMonthBounds } from "@/lib/dashboard/month-bounds";
import { buildFinancialSessionRecord, type FinancialSessionRecord } from "@/lib/financial/financial-session-record";
import { getEffectiveInstructorId } from "@/lib/sessions/instructor-assignment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type FinancialSessionQueryRow = Pick<
  Database["public"]["Tables"]["sessions"]["Row"],
  | "id"
  | "session_date"
  | "status"
  | "instructor_hours"
  | "company_hours"
  | "substitute_instructor_id"
  | "institution_hourly_rate"
  | "instructor_hourly_rate"
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

export async function getFinancialSessionsInRange(
  startDate: string,
  endDate: string,
): Promise<FinancialSessionRecord[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: sessionRows, error: sessionsError }, { data: instructorRows, error: instructorsError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          `id, session_date, status, instructor_hours, company_hours, substitute_instructor_id,
           institution_hourly_rate, instructor_hourly_rate,
           courses(id, name, institution_id, lead_instructor_id, company_hourly_rate, instructor_hourly_wage, institutions(id, name))`,
        )
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

  const records: FinancialSessionRecord[] = [];

  for (const row of (sessionRows ?? []) as FinancialSessionQueryRow[]) {
    const course = row.courses;
    if (!course?.lead_instructor_id) {
      continue;
    }

    const instructorId = getEffectiveInstructorId(
      row.substitute_instructor_id,
      course.lead_instructor_id,
    );

    records.push(
      buildFinancialSessionRecord({
        id: row.id,
        session_date: row.session_date,
        status: row.status as SessionStatus,
        instructor_hours: row.instructor_hours,
        company_hours: row.company_hours,
        instructor_id: instructorId,
        instructor_name: instructorNames.get(instructorId) ?? "מדריך לא ידוע",
        institution_id: course.institution_id,
        institution_name: course.institutions?.name ?? null,
        course_id: course.id,
        course_name: course.name,
        course: {
          company_hourly_rate: course.company_hourly_rate,
          instructor_hourly_wage: course.instructor_hourly_wage,
        },
        session: {
          institution_hourly_rate: row.institution_hourly_rate,
          instructor_hourly_rate: row.instructor_hourly_rate,
        },
      }),
    );
  }

  return records;
}

export async function getFinancialSessionsForMonth(
  monthView: MonthView,
): Promise<FinancialSessionRecord[]> {
  const { startDate, endDate } = getMonthBounds(monthView);
  return getFinancialSessionsInRange(startDate, endDate);
}
