import type { SessionStatus } from "@/components/sessions/constants";
import { getEffectiveInstructorId } from "@/lib/sessions/instructor-assignment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import {
  computeSessionFinancialsFromParts,
  courseRatesFromDb,
  sessionOverridesFromDb,
} from "@/lib/financial/session-financials";

export type PayrollSessionRow = {
  sessionId: string;
  sessionDate: string;
  status: SessionStatus;
  instructorId: string;
  instructorName: string;
  instructorHours: number;
  actualPayout: number;
  potentialPayout: number;
};

type PayrollSessionQueryRow = Pick<
  Database["public"]["Tables"]["sessions"]["Row"],
  | "id"
  | "session_date"
  | "status"
  | "instructor_hours"
  | "substitute_instructor_id"
  | "institution_hourly_rate"
  | "instructor_hourly_rate"
> & {
  courses: Pick<
    Database["public"]["Tables"]["courses"]["Row"],
    "lead_instructor_id" | "company_hourly_rate" | "instructor_hourly_wage"
  > | null;
};

/**
 * Loads sessions for payroll using the same instructor resolution as the admin dashboard.
 * Does not skip sessions with zero payout.
 */
export async function getPayrollSessionsInRange(
  startDate: string,
  endDate: string,
): Promise<PayrollSessionRow[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: sessionRows, error: sessionsError }, { data: instructorRows, error: instructorsError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          `id, session_date, status, instructor_hours, substitute_instructor_id,
           institution_hourly_rate, instructor_hourly_rate,
           courses(lead_instructor_id, company_hourly_rate, instructor_hourly_wage)`,
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

  const rows: PayrollSessionRow[] = [];

  for (const row of (sessionRows ?? []) as PayrollSessionQueryRow[]) {
    const course = row.courses;
    const leadInstructorId = course?.lead_instructor_id;

    if (!leadInstructorId) {
      continue;
    }

    const instructorId = getEffectiveInstructorId(row.substitute_instructor_id, leadInstructorId);

    const financials = course
      ? computeSessionFinancialsFromParts(
          {
            status: row.status as SessionStatus,
            instructor_hours: row.instructor_hours,
            company_hours: 0,
          },
          courseRatesFromDb(course),
          sessionOverridesFromDb(row),
        )
      : {
          actualInstructorPayout: 0,
          potentialInstructorPayout: 0,
        };

    rows.push({
      sessionId: row.id,
      sessionDate: row.session_date,
      status: row.status as SessionStatus,
      instructorId,
      instructorName: instructorNames.get(instructorId) ?? "מדריך לא ידוע",
      instructorHours: row.instructor_hours,
      actualPayout: financials.actualInstructorPayout,
      potentialPayout: financials.potentialInstructorPayout,
    });
  }

  return rows;
}
