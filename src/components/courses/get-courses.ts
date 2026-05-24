import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type CourseListItem = Pick<
  Database["public"]["Tables"]["courses"]["Row"],
  "id" | "name" | "status" | "school_year"
> & {
  institution_name: string | null;
};

type CourseQueryRow = Pick<
  Database["public"]["Tables"]["courses"]["Row"],
  "id" | "name" | "status" | "school_year"
> & {
  institutions: Pick<
    Database["public"]["Tables"]["institutions"]["Row"],
    "name"
  > | null;
};

export async function getCourses(): Promise<CourseListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("courses")
    .select("id, name, status, school_year, institutions(name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as CourseQueryRow[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    school_year: row.school_year,
    institution_name: row.institutions?.name ?? null,
  }));
}
