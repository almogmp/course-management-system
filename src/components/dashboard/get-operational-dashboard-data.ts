import type { SessionStatus } from "@/components/sessions/constants";
import { isSessionDelayed } from "@/lib/sessions/session-delay";
import { isSessionActiveNow } from "@/lib/sessions/session-active";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toLocalDateKey } from "@/lib/date/week";

export type OperationalDashboardSession = {
  id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  course_name: string | null;
  cancellation_reason: string | null;
  is_delayed: boolean;
  status_marked_at: string | null;
};

export type OperationalDashboardData = {
  activeNowSessions: OperationalDashboardSession[];
  delayedArrivalSessions: OperationalDashboardSession[];
  completedTodaySessions: OperationalDashboardSession[];
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

function isMarkedToday(statusMarkedAt: string | null, todayKey: string): boolean {
  if (!statusMarkedAt) {
    return false;
  }

  return toLocalDateKey(new Date(statusMarkedAt)) === todayKey;
}

type AdminOperationalRow = {
  id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  cancellation_reason: string | null;
  status_marked_at: string | null;
  actual_arrival_time: string | null;
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
  status_marked_at: string | null;
  actual_arrival_time: string | null;
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
    status_marked_at: row.status_marked_at,
    is_delayed: isSessionDelayed(
      row.session_date,
      row.start_time,
      row.status,
      row.actual_arrival_time,
    ),
  };
}

export function buildOperationalDashboardData(
  rows: OperationalDashboardSession[],
): OperationalDashboardData {
  const todayKey = toLocalDateKey(new Date());

  const activeNowSessions = sortByStartTime(
    rows.filter((session) =>
      isSessionActiveNow(
        session.session_date,
        session.start_time,
        session.end_time,
        session.status,
      ),
    ),
  );

  const delayedArrivalSessions = sortByStartTime(
    rows.filter((session) => session.is_delayed && session.session_date === todayKey),
  );

  const pendingApprovalSessions = sortByStartTime(
    rows.filter((session) => session.status === "deferred"),
  );

  const completedTodaySessions = sortByStartTime(
    rows.filter((session) => {
      if (session.status !== "completed") {
        return false;
      }

      return (
        isMarkedToday(session.status_marked_at, todayKey) ||
        session.session_date === todayKey
      );
    }),
  );

  return {
    activeNowSessions,
    delayedArrivalSessions,
    completedTodaySessions,
    pendingApprovalSessions,
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
        "id, course_id, session_date, start_time, end_time, status, cancellation_reason, status_marked_at, actual_arrival_time, courses(name)",
      )
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

    return buildOperationalDashboardData(rows);
  }

  const instructorClient = supabase as unknown as typeof supabase & {
    from: (relation: string) => ReturnType<typeof supabase.from>;
  };

  const { data, error } = await instructorClient
    .from("instructor_sessions")
    .select(
      "id, course_id, session_date, start_time, end_time, status, cancellation_reason, status_marked_at, actual_arrival_time, course_name",
    )
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as InstructorOperationalRow[]).map((row) =>
    mapRow({ ...row, course_name: row.course_name ?? null }),
  );

  return buildOperationalDashboardData(rows);
}
