import { getEffectiveInstructorId } from "@/lib/sessions/instructor-assignment";
import { resolveSessionInstructorDisplayName } from "@/lib/sessions/resolve-instructor-display-name";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

import type { CourseStatus } from "@/components/courses/constants";
import type { SessionStatus } from "@/components/sessions/constants";

export type CourseSessionsContext = {
  id: string;
  name: string;
  status: CourseStatus;
  institution_name: string | null;
  lead_instructor_id: string;
  target_instructor_hours: number | null;
  institution_hourly_rate: number;
  instructor_hourly_rate: number;
};

export type CourseSessionListItem = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  instructor_hours: number;
  company_hours: number;
  status: SessionStatus;
  admin_note: string | null;
  cancellation_reason: string | null;
  assigned_instructor_id: string;
  instructor_name: string;
  institution_hourly_rate: number | null;
  instructor_hourly_rate: number | null;
  actual_arrival_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  hebrew_date_label?: string;
};

type CourseQueryRow = Pick<
  Database["public"]["Tables"]["courses"]["Row"],
  | "id"
  | "name"
  | "status"
  | "lead_instructor_id"
  | "target_instructor_hours"
  | "company_hourly_rate"
  | "instructor_hourly_wage"
> & {
  institutions: Pick<Database["public"]["Tables"]["institutions"]["Row"], "name"> | null;
  lead_instructor: Pick<Database["public"]["Tables"]["instructors"]["Row"], "full_name"> | null;
};

type AdminSessionRow = Pick<
  Database["public"]["Tables"]["sessions"]["Row"],
  | "id"
  | "session_date"
  | "start_time"
  | "end_time"
  | "instructor_hours"
  | "company_hours"
  | "status"
  | "admin_note"
  | "substitute_instructor_id"
  | "cancellation_reason"
  | "actual_arrival_time"
  | "actual_start_time"
  | "actual_end_time"
  | "institution_hourly_rate"
  | "instructor_hourly_rate"
> & {
  substitute_instructor: Pick<
    Database["public"]["Tables"]["instructors"]["Row"],
    "full_name"
  > | null;
};

type InstructorSessionRow = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  instructor_hours: number;
  status: SessionStatus;
  cancellation_reason: string | null;
  substitute_instructor_id: string | null;
  actual_arrival_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
};

export async function getCourseSessionsPageData(
  courseId: string,
  options?: { useInstructorView?: boolean },
): Promise<{ course: CourseSessionsContext; sessions: CourseSessionListItem[] } | null> {
  const supabase = await createServerSupabaseClient();
  const useInstructorView = options?.useInstructorView ?? false;

  if (useInstructorView) {
    const instructorClient = supabase as unknown as typeof supabase & {
      from: (relation: string) => ReturnType<typeof supabase.from>;
    };

    const { data: sessionRows, error: sessionsError } = await instructorClient
      .from("instructor_sessions")
      .select(
        "id, session_date, start_time, end_time, instructor_hours, status, cancellation_reason, substitute_instructor_id, course_id, course_name, actual_arrival_time, actual_start_time, actual_end_time",
      )
      .eq("course_id", courseId)
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (sessionsError) {
      throw new Error(sessionsError.message);
    }

    const firstRow = sessionRows?.[0] as
      | (InstructorSessionRow & { course_id: string; course_name: string })
      | undefined;

    if (!sessionRows || sessionRows.length === 0) {
      return {
        course: {
          id: courseId,
          name: "קורס",
          status: "active",
          institution_name: null,
          lead_instructor_id: "",
          target_instructor_hours: null,
          institution_hourly_rate: 0,
          instructor_hourly_rate: 0,
        },
        sessions: [],
      };
    }

    const course: CourseSessionsContext = {
      id: courseId,
      name: firstRow?.course_name ?? "קורס",
      status: "active",
      institution_name: null,
      lead_instructor_id: "",
      target_instructor_hours: null,
      institution_hourly_rate: 0,
      instructor_hourly_rate: 0,
    };

    const sessions: CourseSessionListItem[] = (
      sessionRows as Array<
        InstructorSessionRow & { course_id: string; course_name: string }
      >
    ).map((row) => ({
      id: row.id,
      session_date: row.session_date,
      start_time: row.start_time,
      end_time: row.end_time,
      instructor_hours: row.instructor_hours,
      company_hours: 0,
      status: row.status,
      admin_note: null,
      cancellation_reason: row.cancellation_reason,
      assigned_instructor_id: row.substitute_instructor_id ?? "",
      instructor_name: "—",
      institution_hourly_rate: null,
      instructor_hourly_rate: null,
      actual_arrival_time: row.actual_arrival_time,
      actual_start_time: row.actual_start_time,
      actual_end_time: row.actual_end_time,
    }));

    return { course, sessions };
  }

  const { data: courseRow, error: courseError } = await supabase
    .from("courses")
    .select(
      `id, name, status, lead_instructor_id, target_instructor_hours, company_hourly_rate, instructor_hourly_wage,
       institutions(name),
       lead_instructor:instructors!courses_lead_instructor_id_fkey(full_name)`,
    )
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message);
  }

  if (!courseRow) {
    return null;
  }

  const courseData = courseRow as CourseQueryRow;

  const [{ data: sessionRows, error: sessionsError }, { data: instructorRows, error: instructorsError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          `id, session_date, start_time, end_time, instructor_hours, company_hours, status, admin_note,
           substitute_instructor_id, cancellation_reason, actual_arrival_time, actual_start_time, actual_end_time,
           institution_hourly_rate, instructor_hourly_rate,
           substitute_instructor:instructors!sessions_substitute_instructor_id_fkey(full_name)`,
        )
        .eq("course_id", courseId)
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true }),
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

  const course: CourseSessionsContext = {
    id: courseData.id,
    name: courseData.name,
    status: courseData.status,
    institution_name: courseData.institutions?.name ?? null,
    lead_instructor_id: courseData.lead_instructor_id,
    target_instructor_hours: courseData.target_instructor_hours ?? null,
    institution_hourly_rate: courseData.company_hourly_rate,
    instructor_hourly_rate: courseData.instructor_hourly_wage,
  };

  const sessions: CourseSessionListItem[] = ((sessionRows ?? []) as AdminSessionRow[]).map(
    (row) => ({
      id: row.id,
      session_date: row.session_date,
      start_time: row.start_time,
      end_time: row.end_time,
      instructor_hours: row.instructor_hours,
      company_hours: row.company_hours,
      status: row.status,
      admin_note: row.admin_note,
      cancellation_reason: row.cancellation_reason,
      assigned_instructor_id: getEffectiveInstructorId(
        row.substitute_instructor_id,
        course.lead_instructor_id,
      ),
      instructor_name: resolveSessionInstructorDisplayName({
        substituteInstructorId: row.substitute_instructor_id,
        substituteName: row.substitute_instructor?.full_name,
        leadInstructorId: course.lead_instructor_id,
        leadName: courseData.lead_instructor?.full_name,
        nameById: instructorNames,
      }),
      institution_hourly_rate: row.institution_hourly_rate,
      instructor_hourly_rate: row.instructor_hourly_rate,
      actual_arrival_time: row.actual_arrival_time,
      actual_start_time: row.actual_start_time,
      actual_end_time: row.actual_end_time,
    }),
  );

  return { course, sessions };
}
