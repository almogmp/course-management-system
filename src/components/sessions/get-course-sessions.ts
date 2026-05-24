import { getEffectiveInstructorId } from "@/lib/sessions/instructor-assignment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

import type { CourseStatus } from "@/components/courses/constants";
import type { SessionStatus } from "@/components/sessions/constants";

export type CourseSessionsContext = {
  id: string;
  name: string;
  school_year: string;
  status: CourseStatus;
  institution_name: string | null;
  lead_instructor_id: string;
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
  actual_arrival_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
};

type CourseQueryRow = Pick<
  Database["public"]["Tables"]["courses"]["Row"],
  "id" | "name" | "school_year" | "status" | "lead_instructor_id"
> & {
  institutions: Pick<Database["public"]["Tables"]["institutions"]["Row"], "name"> | null;
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
>;

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
          school_year: "—",
          status: "active",
          institution_name: null,
          lead_instructor_id: "",
        },
        sessions: [],
      };
    }

    const course: CourseSessionsContext = {
      id: courseId,
      name: firstRow?.course_name ?? "קורס",
      school_year: "",
      status: "active",
      institution_name: null,
      lead_instructor_id: "",
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
      actual_arrival_time: row.actual_arrival_time,
      actual_start_time: row.actual_start_time,
      actual_end_time: row.actual_end_time,
    }));

    return { course, sessions };
  }

  const { data: courseRow, error: courseError } = await supabase
    .from("courses")
    .select("id, name, school_year, status, lead_instructor_id, institutions(name)")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message);
  }

  if (!courseRow) {
    return null;
  }

  const courseData = courseRow as CourseQueryRow;

  const { data: sessionRows, error: sessionsError } = await supabase
    .from("sessions")
    .select(
      "id, session_date, start_time, end_time, instructor_hours, company_hours, status, admin_note, substitute_instructor_id, cancellation_reason, actual_arrival_time, actual_start_time, actual_end_time",
    )
    .eq("course_id", courseId)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  const course: CourseSessionsContext = {
    id: courseData.id,
    name: courseData.name,
    school_year: courseData.school_year,
    status: courseData.status,
    institution_name: courseData.institutions?.name ?? null,
    lead_instructor_id: courseData.lead_instructor_id,
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
      actual_arrival_time: row.actual_arrival_time,
      actual_start_time: row.actual_start_time,
      actual_end_time: row.actual_end_time,
    }),
  );

  return { course, sessions };
}
