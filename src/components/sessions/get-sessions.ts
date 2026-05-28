import type { SessionStatus } from "@/components/sessions/constants";
import { getCurrentInstructorId } from "@/lib/auth/instructor";
import { resolveSessionInstructorDisplayName } from "@/lib/sessions/resolve-instructor-display-name";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type SessionListItem = {
  id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  instructor_hours: number;
  course_name: string;
  institution_name: string;
  instructor_name: string;
};

type AdminSessionQueryRow = Pick<
  Database["public"]["Tables"]["sessions"]["Row"],
  | "id"
  | "session_date"
  | "start_time"
  | "end_time"
  | "status"
  | "substitute_instructor_id"
> & {
  substitute_instructor: Pick<Database["public"]["Tables"]["instructors"]["Row"], "full_name"> | null;
  courses: Pick<
    Database["public"]["Tables"]["courses"]["Row"],
    "id" | "name" | "lead_instructor_id"
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
  course_name: string;
  institution_name: string | null;
  substitute_instructor_id: string | null;
};

async function getAdminSessionsList(): Promise<SessionListItem[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: sessionRows, error: sessionsError }, { data: instructorRows, error: instructorsError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          `id, session_date, start_time, end_time, status, substitute_instructor_id,
           substitute_instructor:instructors!sessions_substitute_instructor_id_fkey(full_name),
           courses(
             id, name, lead_instructor_id,
             institutions(name),
             lead_instructor:instructors!courses_lead_instructor_id_fkey(full_name)
           )`,
        )
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

  return ((sessionRows ?? []) as AdminSessionQueryRow[])
    .filter((row) => row.courses)
    .map((row) => {
      const course = row.courses!;

      return {
        id: row.id,
        course_id: course.id,
        session_date: row.session_date,
        start_time: row.start_time,
        end_time: row.end_time,
        status: row.status as SessionStatus,
        instructor_hours: 0,
        course_name: course.name,
        institution_name: course.institutions?.name ?? "—",
        instructor_name: resolveSessionInstructorDisplayName({
          substituteInstructorId: row.substitute_instructor_id,
          substituteName: row.substitute_instructor?.full_name,
          leadInstructorId: course.lead_instructor_id,
          leadName: course.lead_instructor?.full_name,
          nameById: instructorNames,
        }),
      };
    });
}

async function getInstructorSessionsList(): Promise<SessionListItem[]> {
  const supabase = await createServerSupabaseClient();
  const instructorClient = supabase as unknown as typeof supabase & {
    from: (relation: string) => ReturnType<typeof supabase.from>;
  };

  const { data: sessionRows, error } = await instructorClient
    .from("instructor_sessions")
    .select(
      "id, course_id, session_date, start_time, end_time, status, instructor_hours, course_name, institution_name, substitute_instructor_id",
    )
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

  return ((sessionRows ?? []) as InstructorSessionQueryRow[]).map((row) => ({
    id: row.id,
    course_id: row.course_id,
    session_date: row.session_date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    instructor_hours: row.instructor_hours,
    course_name: row.course_name ?? "—",
    institution_name: row.institution_name ?? "—",
    instructor_name: selfName,
  }));
}

export async function getSessionsForPage(isAdmin: boolean): Promise<SessionListItem[]> {
  if (isAdmin) {
    return getAdminSessionsList();
  }

  return getInstructorSessionsList();
}

/** @deprecated Use getSessionsForPage */
export async function getSessions(): Promise<SessionListItem[]> {
  return getAdminSessionsList();
}
