import type { WeeklyCalendarSession } from "@/components/calendar/types";
import type { SessionStatus } from "@/components/sessions/constants";
import { getEffectiveInstructorId } from "@/lib/sessions/instructor-assignment";
import { isSessionDelayed } from "@/lib/sessions/session-delay";
import { getWeekRange } from "@/lib/date/week";
import type { SupabaseServerClient } from "@/lib/supabase/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type AdminSessionQueryRow = Pick<
  Database["public"]["Tables"]["sessions"]["Row"],
  | "id"
  | "session_date"
  | "start_time"
  | "end_time"
  | "status"
  | "instructor_hours"
  | "company_hours"
  | "admin_note"
  | "substitute_instructor_id"
  | "actual_arrival_time"
  | "actual_start_time"
  | "actual_end_time"
> & {
  courses: Pick<
    Database["public"]["Tables"]["courses"]["Row"],
    "id" | "name" | "institution_id" | "lead_instructor_id"
  > & {
    institutions: Pick<Database["public"]["Tables"]["institutions"]["Row"], "name"> | null;
    lead_instructor: Pick<
      Database["public"]["Tables"]["instructors"]["Row"],
      "id" | "full_name"
    > | null;
  } | null;
  substitute_instructor: Pick<
    Database["public"]["Tables"]["instructors"]["Row"],
    "id" | "full_name"
  > | null;
};

type InstructorSessionQueryRow = {
  id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  instructor_hours: number;
  course_name: string;
  substitute_instructor_id: string | null;
  actual_arrival_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
};

function mapToCalendarSession(
  row: {
    id: string;
    course_id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    status: SessionStatus;
    instructor_hours: number;
    company_hours: number | null;
    course_name: string | null;
    institution_id: string | null;
    institution_name: string | null;
    instructor_id: string | null;
    instructor_name: string | null;
    admin_note: string | null;
    actual_arrival_time: string | null;
    actual_start_time: string | null;
    actual_end_time: string | null;
  },
): WeeklyCalendarSession {
  return {
    ...row,
    is_delayed: isSessionDelayed(
      row.session_date,
      row.start_time,
      row.status,
      row.actual_arrival_time,
    ),
  };
}

async function fetchAdminWeeklySessions(
  supabase: SupabaseServerClient,
  startDate: string,
  endDate: string,
): Promise<WeeklyCalendarSession[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `id, session_date, start_time, end_time, status, instructor_hours, company_hours, admin_note,
       substitute_instructor_id, actual_arrival_time, actual_start_time, actual_end_time,
       courses(id, name, institution_id, lead_instructor_id, institutions(name),
         lead_instructor:instructors!courses_lead_instructor_id_fkey(id, full_name)),
       substitute_instructor:instructors!sessions_substitute_instructor_id_fkey(id, full_name)`,
    )
    .gte("session_date", startDate)
    .lte("session_date", endDate)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as AdminSessionQueryRow[];

  return rows.map((row) => {
    const leadInstructorId = row.courses?.lead_instructor_id ?? "";
    const effectiveInstructorId = getEffectiveInstructorId(
      row.substitute_instructor_id,
      leadInstructorId,
    );

    return mapToCalendarSession({
      id: row.id,
      course_id: row.courses?.id ?? "",
      session_date: row.session_date,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status,
      instructor_hours: row.instructor_hours,
      company_hours: row.company_hours,
      course_name: row.courses?.name ?? null,
      institution_id: row.courses?.institution_id ?? null,
      institution_name: row.courses?.institutions?.name ?? null,
      instructor_id: effectiveInstructorId,
      instructor_name:
        row.substitute_instructor?.full_name ??
        row.courses?.lead_instructor?.full_name ??
        null,
      admin_note: row.admin_note,
      actual_arrival_time: row.actual_arrival_time,
      actual_start_time: row.actual_start_time,
      actual_end_time: row.actual_end_time,
    });
  });
}

async function fetchInstructorWeeklySessions(
  supabase: SupabaseServerClient,
  startDate: string,
  endDate: string,
): Promise<WeeklyCalendarSession[]> {
  const instructorClient = supabase as unknown as SupabaseServerClient & {
    from: (relation: string) => ReturnType<SupabaseServerClient["from"]>;
  };

  const { data, error } = await instructorClient
    .from("instructor_sessions")
    .select(
      "id, course_id, session_date, start_time, end_time, status, instructor_hours, course_name, substitute_instructor_id, actual_arrival_time, actual_start_time, actual_end_time",
    )
    .gte("session_date", startDate)
    .lte("session_date", endDate)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as InstructorSessionQueryRow[];

  return rows.map((row) =>
    mapToCalendarSession({
      id: row.id,
      course_id: row.course_id,
      session_date: row.session_date,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status,
      instructor_hours: row.instructor_hours,
      company_hours: null,
      course_name: row.course_name ?? null,
      institution_id: null,
      institution_name: null,
      instructor_id: row.substitute_instructor_id,
      instructor_name: null,
      admin_note: null,
      actual_arrival_time: row.actual_arrival_time,
      actual_start_time: row.actual_start_time,
      actual_end_time: row.actual_end_time,
    }),
  );
}

export async function getCalendarSessionsInRange(
  isAdmin: boolean,
  startDate: string,
  endDate: string,
): Promise<WeeklyCalendarSession[]> {
  const supabase = await createServerSupabaseClient();

  return isAdmin
    ? fetchAdminWeeklySessions(supabase, startDate, endDate)
    : fetchInstructorWeeklySessions(supabase, startDate, endDate);
}

export async function getWeeklySessions(
  isAdmin: boolean,
  weekStart?: string,
): Promise<{
  weekRange: ReturnType<typeof getWeekRange>;
  sessions: WeeklyCalendarSession[];
}> {
  const referenceDate = weekStart ? new Date(`${weekStart}T12:00:00`) : new Date();
  const weekRange = getWeekRange(referenceDate);
  const sessions = await getCalendarSessionsInRange(
    isAdmin,
    weekRange.startDate,
    weekRange.endDate,
  );

  return { weekRange, sessions };
}

export async function getCalendarFilterOptions(isAdmin: boolean): Promise<{
  instructors: Array<{ id: string; name: string }>;
  institutions: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; name: string }>;
}> {
  const supabase = await createServerSupabaseClient();

  if (!isAdmin) {
    const instructorClient = supabase as unknown as typeof supabase & {
      from: (relation: string) => ReturnType<typeof supabase.from>;
    };

    const { data } = await instructorClient
      .from("instructor_sessions")
      .select("course_id, course_name");

    const coursesMap = new Map<string, string>();

    for (const row of (data ?? []) as Array<{ course_id: string; course_name: string }>) {
      coursesMap.set(row.course_id, row.course_name);
    }

    return {
      instructors: [],
      institutions: [],
      courses: Array.from(coursesMap.entries()).map(([id, name]) => ({ id, name })),
    };
  }

  const [{ data: instructors }, { data: institutions }, { data: courses }] = await Promise.all([
    supabase.from("instructors").select("id, full_name").order("full_name"),
    supabase.from("institutions").select("id, name").order("name"),
    supabase.from("courses").select("id, name").order("name"),
  ]);

  return {
    instructors: (instructors ?? []).map((row) => ({ id: row.id, name: row.full_name })),
    institutions: (institutions ?? []).map((row) => ({ id: row.id, name: row.name })),
    courses: (courses ?? []).map((row) => ({ id: row.id, name: row.name })),
  };
}
