import type { MonthView } from "@/components/calendar/month-calendar-utils";
import type { SessionStatus } from "@/components/sessions/constants";
import { getMonthBounds, isSessionInMonth } from "@/lib/dashboard/month-bounds";
import {
  computeInstructorMonthlyWorkload,
  type InstructorWorkloadRow,
} from "@/lib/dashboard/workload";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseServerClient } from "@/lib/supabase/server";

export type InstructorDashboardSession = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  instructor_hours: number;
  course_name: string | null;
  institution_name: string | null;
  notes: string | null;
};

type InstructorSessionRow = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  instructor_hours: number;
  course_name: string;
  cancellation_reason: string | null;
};

export type InstructorMonthlyWorkloadStats = Omit<
  InstructorWorkloadRow,
  "instructorId" | "instructorName"
>;

export type InstructorDashboardStats = {
  instructorHoursThisMonth: number;
  completedThisMonth: number;
  plannedThisMonth: number;
  cancelledThisMonth: number;
  pendingApprovalThisMonth: number;
  workload: InstructorMonthlyWorkloadStats;
};

async function fetchInstructorSessionsInRange(
  supabase: SupabaseServerClient,
  startDate: string,
  endDate: string,
): Promise<InstructorDashboardSession[]> {
  const instructorClient = supabase as unknown as SupabaseServerClient & {
    from: (relation: string) => ReturnType<SupabaseServerClient["from"]>;
  };

  const { data, error } = await instructorClient
    .from("instructor_sessions")
    .select(
      "id, session_date, start_time, end_time, status, instructor_hours, course_name, cancellation_reason",
    )
    .gte("session_date", startDate)
    .lte("session_date", endDate)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as InstructorSessionRow[];

  return rows.map((row) => ({
    id: row.id,
    session_date: row.session_date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    instructor_hours: row.instructor_hours,
    course_name: row.course_name ?? null,
    institution_name: null,
    notes: row.cancellation_reason,
  }));
}

export function computeInstructorDashboardStats(
  sessions: InstructorDashboardSession[],
): InstructorDashboardStats {
  const workload = computeInstructorMonthlyWorkload(
    sessions.map((session) => ({
      status: session.status,
      instructor_hours: session.instructor_hours,
      company_hours: 0,
    })),
  );

  return {
    instructorHoursThisMonth: workload.instructorHours,
    completedThisMonth: workload.completedCount,
    plannedThisMonth: workload.plannedCount,
    cancelledThisMonth: workload.cancelledCount,
    pendingApprovalThisMonth: workload.pendingApprovalCount,
    workload,
  };
}

export async function getInstructorDashboardData(monthView: MonthView): Promise<{
  sessions: InstructorDashboardSession[];
  stats: InstructorDashboardStats;
}> {
  const { startDate, endDate } = getMonthBounds(monthView);
  const supabase = await createServerSupabaseClient();
  const sessions = await fetchInstructorSessionsInRange(supabase, startDate, endDate);
  const monthSessions = sessions.filter((session) =>
    isSessionInMonth(session.session_date, monthView),
  );
  const stats = computeInstructorDashboardStats(monthSessions);

  return { sessions: monthSessions, stats };
}
