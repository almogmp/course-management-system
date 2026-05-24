import type { MonthView } from "@/components/calendar/month-calendar-utils";
import type { SessionStatus } from "@/components/sessions/constants";
import { getMonthBounds } from "@/lib/dashboard/month-bounds";
import {
  aggregateInstructorWorkload,
  computeMonthlyOverview,
  type InstructorWorkloadRow,
  type MonthlyOverviewStats,
} from "@/lib/dashboard/workload";
import { getEffectiveInstructorId } from "@/lib/sessions/instructor-assignment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type AdminSessionWorkloadRow = Pick<
  Database["public"]["Tables"]["sessions"]["Row"],
  | "id"
  | "session_date"
  | "status"
  | "instructor_hours"
  | "company_hours"
  | "substitute_instructor_id"
> & {
  courses: Pick<Database["public"]["Tables"]["courses"]["Row"], "lead_instructor_id"> | null;
};

export type AdminDashboardData = {
  overview: MonthlyOverviewStats;
  workloadRows: InstructorWorkloadRow[];
};

export async function getAdminDashboardData(monthView: MonthView): Promise<AdminDashboardData> {
  const { startDate, endDate } = getMonthBounds(monthView);
  const supabase = await createServerSupabaseClient();

  const [{ data: sessionRows, error: sessionsError }, { data: instructorRows, error: instructorsError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          "id, session_date, status, instructor_hours, company_hours, substitute_instructor_id, courses(lead_instructor_id)",
        )
        .gte("session_date", startDate)
        .lte("session_date", endDate),
      supabase.from("instructors").select("id, full_name").order("full_name", { ascending: true }),
    ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (instructorsError) {
    throw new Error(instructorsError.message);
  }

  const instructorNames = new Map(
    (instructorRows ?? []).map((instructor) => [instructor.id, instructor.full_name]),
  );

  const workloadEntries: Array<{
    instructorId: string;
    instructorName: string;
    session: {
      status: SessionStatus;
      instructor_hours: number;
      company_hours: number;
    };
  }> = [];

  const overviewSessions: Array<{
    status: SessionStatus;
    instructor_hours: number;
    company_hours: number;
  }> = [];

  for (const row of (sessionRows ?? []) as AdminSessionWorkloadRow[]) {
    const leadInstructorId = row.courses?.lead_instructor_id;

    if (!leadInstructorId) {
      continue;
    }

    const session = {
      status: row.status,
      instructor_hours: row.instructor_hours,
      company_hours: row.company_hours,
    };

    overviewSessions.push(session);

    const instructorId = getEffectiveInstructorId(
      row.substitute_instructor_id,
      leadInstructorId,
    );

    workloadEntries.push({
      instructorId,
      instructorName: instructorNames.get(instructorId) ?? "מדריך לא ידוע",
      session,
    });
  }

  return {
    overview: computeMonthlyOverview(overviewSessions),
    workloadRows: aggregateInstructorWorkload(workloadEntries),
  };
}
