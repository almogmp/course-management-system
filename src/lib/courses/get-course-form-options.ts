import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CourseFormOptions = {
  institutions: Array<{ id: string; name: string }>;
  suppliers: Array<{ id: string; name: string }>;
  instructors: Array<{ id: string; full_name: string }>;
  coordinators: Array<{
    id: string;
    institution_id: string;
    full_name: string;
  }>;
};

export async function getCourseFormOptions(): Promise<CourseFormOptions> {
  const supabase = await createServerSupabaseClient();

  const [{ data: institutions }, { data: suppliers }, { data: instructors }, { data: coordinators }] =
    await Promise.all([
      supabase.from("institutions").select("id, name").order("name"),
      supabase.from("primary_suppliers").select("id, name").order("name"),
      supabase.from("instructors").select("id, full_name").order("full_name"),
      supabase.from("institution_coordinators").select("id, institution_id, full_name").eq("is_active", true).order("full_name"),
    ]);

  return {
    institutions: institutions ?? [],
    suppliers: suppliers ?? [],
    instructors: instructors ?? [],
    coordinators: coordinators ?? [],
  };
}
