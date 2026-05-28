import {
  formatMonthLabel,
  formatMonthParam,
  parseMonthParam,
  type MonthView,
} from "@/components/calendar/month-calendar-utils";
import type { SessionListItem } from "@/components/sessions/get-sessions";
import type { SessionStatus } from "@/components/sessions/constants";
import { getCurrentInstructorId } from "@/lib/auth/instructor";
import { getMonthBounds } from "@/lib/dashboard/month-bounds";
import {
  computeSessionsMonthSummary,
  type SessionSummarySourceRow,
  type SessionsMonthSummary,
} from "@/lib/sessions/compute-month-summary";
import { coerceSessionHours } from "@/lib/sessions/coerce-session-hours";
import { resolveSessionInstructorDisplayName } from "@/lib/sessions/resolve-instructor-display-name";
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
  | "substitute_instructor_id"
  | "institution_hourly_rate"
  | "instructor_hourly_rate"
> & {
  substitute_instructor: Pick<Database["public"]["Tables"]["instructors"]["Row"], "full_name"> | null;
  courses: Pick<
    Database["public"]["Tables"]["courses"]["Row"],
    "id" | "name" | "lead_instructor_id" | "company_hourly_rate" | "instructor_hourly_wage"
  > & {
    institutions: Pick<Database["public"]["Tables"]["institutions"]["Row"], "name"> | null;
    lead_instructor: Pick<Database["public"]["Tables"]["instructors"]["Row"], "full_name"> | null;
  } | null;
};

type InstructorSessionQueryRow = {
  id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  instructor_hours: number;
  course_name: string | null;
  institution_name: string | null;
  substitute_instructor_id: string | null;
};

export type SessionsPageData = {
  sessions: SessionListItem[];
  summary: SessionsMonthSummary;
  monthView: MonthView;
  monthParam: string;
  monthLabel: string;
  showAdminActions: boolean;
};

async function getAdminSessionsForMonth(
  startDate: string,
  endDate: string,
): Promise<{ sessions: SessionListItem[]; summaryRows: SessionSummarySourceRow[] }> {
  const supabase = await createServerSupabaseClient();

  const [{ data: sessionRows, error: sessionsError }, { data: instructorRows, error: instructorsError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          `id, session_date, start_time, end_time, status, instructor_hours, company_hours,
           substitute_instructor_id, institution_hourly_rate, instructor_hourly_rate,
           substitute_instructor:instructors!sessions_substitute_instructor_id_fkey(full_name),
           courses(
             id, name, lead_instructor_id, company_hourly_rate, instructor_hourly_wage,
             institutions(name),
             lead_instructor:instructors!courses_lead_instructor_id_fkey(full_name)
           )`,
        )
        .gte("session_date", startDate)
        .lte("session_date", endDate)
        .order("session_date", { ascending: false })
        .order("start_time", { ascending: false }),
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

  const sessions: SessionListItem[] = [];
  const summaryRows: SessionSummarySourceRow[] = [];

  for (const row of (sessionRows ?? []) as AdminSessionQueryRow[]) {
    if (!row.courses?.lead_instructor_id) {
      continue;
    }

    const course = row.courses;

    const instructorHours = coerceSessionHours(row.instructor_hours);

    summaryRows.push({
      status: row.status as SessionStatus,
      instructor_hours: instructorHours,
      company_hours: row.company_hours,
      course: {
        company_hourly_rate: course.company_hourly_rate,
        instructor_hourly_wage: course.instructor_hourly_wage,
      },
      session: {
        institution_hourly_rate: row.institution_hourly_rate,
        instructor_hourly_rate: row.instructor_hourly_rate,
      },
    });

    sessions.push({
      id: row.id,
      course_id: course.id,
      session_date: row.session_date,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status as SessionStatus,
      instructor_hours: instructorHours,
      course_name: course.name,
      institution_name: course.institutions?.name ?? "—",
      instructor_name: resolveSessionInstructorDisplayName({
        substituteInstructorId: row.substitute_instructor_id,
        substituteName: row.substitute_instructor?.full_name,
        leadInstructorId: course.lead_instructor_id,
        leadName: course.lead_instructor?.full_name,
        nameById: instructorNames,
      }),
    });
  }

  return { sessions, summaryRows };
}

async function getInstructorSessionsForMonth(
  startDate: string,
  endDate: string,
): Promise<{ sessions: SessionListItem[]; summaryRows: SessionSummarySourceRow[] }> {
  const supabase = await createServerSupabaseClient();
  const instructorClient = supabase as unknown as typeof supabase & {
    from: (relation: string) => ReturnType<typeof supabase.from>;
  };

  const { data: sessionRows, error } = await instructorClient
    .from("instructor_sessions")
    .select(
      "id, course_id, session_date, start_time, end_time, status, instructor_hours, course_name, institution_name, substitute_instructor_id",
    )
    .gte("session_date", startDate)
    .lte("session_date", endDate)
    .order("session_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const currentInstructorId = await getCurrentInstructorId();
  let selfName = "—";

  if (currentInstructorId) {
    const { data: instructorRow } = await supabase
      .from("instructors")
      .select("full_name")
      .eq("id", currentInstructorId)
      .maybeSingle();

    selfName = instructorRow?.full_name ?? "—";
  }

  const sessions: SessionListItem[] = [];
  const summaryRows: SessionSummarySourceRow[] = [];

  for (const row of (sessionRows ?? []) as InstructorSessionQueryRow[]) {
    const instructorHours = coerceSessionHours(row.instructor_hours);

    summaryRows.push({
      status: row.status,
      instructor_hours: instructorHours,
      company_hours: 0,
      course: { company_hourly_rate: 0, instructor_hourly_wage: 0 },
      session: { institution_hourly_rate: null, instructor_hourly_rate: null },
    });

    sessions.push({
      id: row.id,
      course_id: row.course_id,
      session_date: row.session_date,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status,
      instructor_hours: instructorHours,
      course_name: row.course_name ?? "—",
      institution_name: row.institution_name ?? "—",
      instructor_name: selfName,
    });
  }

  return { sessions, summaryRows };
}

export async function getSessionsPageData(
  showAdminActions: boolean,
  monthQuery?: string,
): Promise<SessionsPageData> {
  const monthView = parseMonthParam(monthQuery);
  const { startDate, endDate } = getMonthBounds(monthView);

  const { sessions, summaryRows } = showAdminActions
    ? await getAdminSessionsForMonth(startDate, endDate)
    : await getInstructorSessionsForMonth(startDate, endDate);

  const summary = computeSessionsMonthSummary(summaryRows, {
    includeFinancials: showAdminActions,
  });

  return {
    sessions,
    summary,
    monthView,
    monthParam: formatMonthParam(monthView),
    monthLabel: formatMonthLabel(monthView),
    showAdminActions,
  };
}
