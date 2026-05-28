import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentSchoolYearStartYear, getSchoolYear } from "@/lib/school-year";
import type { Database } from "@/types/database";

export type CourseListItem = Pick<
  Database["public"]["Tables"]["courses"]["Row"],
  "id" | "name" | "status"
> & {
  institution_name: string | null;
  lead_instructor_name: string | null;
  coordinator_name: string | null;
};

type CourseQueryRow = Pick<
  Database["public"]["Tables"]["courses"]["Row"],
  "id" | "name" | "status"
> & {
  institutions: Pick<
    Database["public"]["Tables"]["institutions"]["Row"],
    "name"
  > | null;
  lead_instructor: Pick<
    Database["public"]["Tables"]["instructors"]["Row"],
    "full_name"
  > | null;
  coordinator: Pick<
    Database["public"]["Tables"]["institution_coordinators"]["Row"],
    "full_name"
  > | null;
};

export type CoursesPageFilters = {
  instructorId?: string;
  institutionId?: string;
  coordinatorId?: string;
  schoolYearStart?: number;
};

async function getCourseIdsForSchoolYear(startYear: number): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  const schoolYear = getSchoolYear(startYear);

  const { data, error } = await supabase
    .from("sessions")
    .select("course_id")
    .gte("session_date", schoolYear.startDate)
    .lte("session_date", schoolYear.endDate);

  if (error) {
    throw new Error(error.message);
  }

  const unique = new Set((data ?? []).map((row) => row.course_id).filter(Boolean));
  return Array.from(unique);
}

export async function getCourses(filters?: CoursesPageFilters): Promise<CourseListItem[]> {
  const supabase = await createServerSupabaseClient();

  const schoolYearStart = filters?.schoolYearStart ?? getCurrentSchoolYearStartYear();
  const courseIds = await getCourseIdsForSchoolYear(schoolYearStart);

  if (courseIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("courses")
    .select(
      "id, name, status, institutions(name), lead_instructor:instructors!courses_lead_instructor_id_fkey(full_name), coordinator:institution_coordinators!courses_coordinator_id_fkey(full_name)",
    )
    .neq("status", "archived")
    .in("id", courseIds)
    .order("created_at", { ascending: false });

  if (filters?.instructorId) {
    query = query.eq("lead_instructor_id", filters.instructorId);
  }

  if (filters?.institutionId) {
    query = query.eq("institution_id", filters.institutionId);
  }

  if (filters?.coordinatorId) {
    query = query.eq("coordinator_id", filters.coordinatorId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as CourseQueryRow[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    institution_name: row.institutions?.name ?? null,
    lead_instructor_name: row.lead_instructor?.full_name ?? null,
    coordinator_name: row.coordinator?.full_name ?? null,
  }));
}

async function getInstructorCoursesList(): Promise<CourseListItem[]> {
  const supabase = await createServerSupabaseClient();
  const instructorClient = supabase as unknown as typeof supabase & {
    from: (relation: string) => ReturnType<typeof supabase.from>;
  };

  const { data, error } = await instructorClient
    .from("instructor_sessions")
    .select("course_id, course_name");

  if (error) {
    throw new Error(error.message);
  }

  const byCourse = new Map<string, CourseListItem>();

  for (const row of (data ?? []) as Array<{ course_id: string; course_name: string }>) {
    const courseId = row.course_id;
    const courseName = row.course_name;

    if (!courseId || byCourse.has(courseId)) {
      continue;
    }

    byCourse.set(courseId, {
      id: courseId,
      name: courseName ?? "קורס",
      status: "active",
      institution_name: null,
      lead_instructor_name: null,
      coordinator_name: null,
    });
  }

  return Array.from(byCourse.values()).sort((a, b) => a.name.localeCompare(b.name, "he"));
}

export async function getCoursesForPage(
  isAdmin: boolean,
  filters?: CoursesPageFilters,
): Promise<CourseListItem[]> {
  if (isAdmin) {
    return getCourses(filters);
  }

  return getInstructorCoursesList();
}
