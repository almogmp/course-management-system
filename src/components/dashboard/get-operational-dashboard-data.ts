import type { SessionStatus } from "@/components/sessions/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type OperationalDashboardSession = {
  id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  course_name: string | null;
  cancellation_reason: string | null;
};

export type OperationalDashboardData = {
  pendingApprovalSessions: OperationalDashboardSession[];
};

function sortByStartTime(sessions: OperationalDashboardSession[]): OperationalDashboardSession[] {
  return [...sessions].sort((a, b) => {
    if (a.session_date !== b.session_date) {
      return a.session_date.localeCompare(b.session_date);
    }

    return a.start_time.localeCompare(b.start_time);
  });
}

type AdminOperationalRow = {
  id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  cancellation_reason: string | null;
  courses: { name: string } | null;
};

type InstructorOperationalRow = {
  id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  cancellation_reason: string | null;
  course_name: string;
};

function mapRow(
  row: Omit<AdminOperationalRow, "courses"> & {
    course_name: string | null;
  },
): OperationalDashboardSession {
  return {
    id: row.id,
    course_id: row.course_id,
    session_date: row.session_date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    course_name: row.course_name,
    cancellation_reason: row.cancellation_reason,
  };
}

export async function getOperationalDashboardData(
  isAdmin: boolean,
): Promise<OperationalDashboardData> {
  const supabase = await createServerSupabaseClient();

  if (isAdmin) {
    const { data, error } = await supabase
      .from("sessions")
      .select(
        "id, course_id, session_date, start_time, end_time, status, cancellation_reason, courses(name)",
      )
      .eq("status", "deferred")
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const rows = ((data ?? []) as AdminOperationalRow[]).map((row) =>
      mapRow({
        ...row,
        course_name: row.courses?.name ?? null,
      }),
    );

    return { pendingApprovalSessions: sortByStartTime(rows) };
  }

  const instructorClient = supabase as unknown as typeof supabase & {
    from: (relation: string) => ReturnType<typeof supabase.from>;
  };

  const { data, error } = await instructorClient
    .from("instructor_sessions")
    .select(
      "id, course_id, session_date, start_time, end_time, status, cancellation_reason, course_name",
    )
    .eq("status", "deferred")
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as InstructorOperationalRow[]).map((row) =>
    mapRow({ ...row, course_name: row.course_name ?? null }),
  );

  return { pendingApprovalSessions: sortByStartTime(rows) };
}
