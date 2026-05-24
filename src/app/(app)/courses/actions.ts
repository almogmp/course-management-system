"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

/** TEMP: FK קבועes זמניים — יוחלפו בבחירה מממשק */
const TEMP_COURSE_FOREIGN_KEYS = {
  institution_id: "",
  primary_supplier_id: "",
  lead_instructor_id: "",
} as const;

type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];

async function resolveTempCourseForeignKeys(): Promise<
  | {
      institution_id: string;
      primary_supplier_id: string;
      lead_instructor_id: string;
    }
  | { error: string }
> {
  const supabase = await createServerSupabaseClient();

  const [institution, supplier, instructor] = await Promise.all([
    TEMP_COURSE_FOREIGN_KEYS.institution_id
      ? Promise.resolve({ data: { id: TEMP_COURSE_FOREIGN_KEYS.institution_id }, error: null })
      : supabase.from("institutions").select("id").order("created_at").limit(1).maybeSingle(),
    TEMP_COURSE_FOREIGN_KEYS.primary_supplier_id
      ? Promise.resolve({
          data: { id: TEMP_COURSE_FOREIGN_KEYS.primary_supplier_id },
          error: null,
        })
      : supabase.from("primary_suppliers").select("id").order("created_at").limit(1).maybeSingle(),
    TEMP_COURSE_FOREIGN_KEYS.lead_instructor_id
      ? Promise.resolve({
          data: { id: TEMP_COURSE_FOREIGN_KEYS.lead_instructor_id },
          error: null,
        })
      : supabase.from("instructors").select("id").order("created_at").limit(1).maybeSingle(),
  ]);

  if (institution.error || supplier.error || instructor.error) {
    return { error: "שגיאה בטעינת נתוני FK זמניים." };
  }

  if (!institution.data || !supplier.data || !instructor.data) {
    return {
      error:
        "חסרים מוסד, ספק ראשי או מדריך במערכת. יש ליצור אותם לפני יצירת קורס.",
    };
  }

  return {
    institution_id: institution.data.id,
    primary_supplier_id: supplier.data.id,
    lead_instructor_id: instructor.data.id,
  };
}

export async function createCourseAction(formData: FormData): Promise<void> {
  await requireAuth();

  const name = String(formData.get("name") ?? "").trim();
  const schoolYear = String(formData.get("school_year") ?? "").trim();
  const coordinator = String(formData.get("coordinator") ?? "").trim();

  if (!name || !schoolYear || !coordinator) {
    redirect(
      `/courses?create=1&error=${encodeURIComponent("יש למלא את כל שדות החובה.")}`,
    );
  }

  const foreignKeys = await resolveTempCourseForeignKeys();
  if ("error" in foreignKeys) {
    redirect(`/courses?create=1&error=${encodeURIComponent(foreignKeys.error)}`);
  }

  const supabase = await createServerSupabaseClient();

  const payload: CourseInsert = {
    name,
    school_year: schoolYear,
    coordinator,
    institution_id: foreignKeys.institution_id,
    primary_supplier_id: foreignKeys.primary_supplier_id,
    lead_instructor_id: foreignKeys.lead_instructor_id,
    status: "active",
    instructor_hourly_wage: 0,
    company_hourly_rate: 0,
    instructor_hours: 0,
    company_hours: 0,
  };

  const { error } = await supabase.from("courses").insert(payload);

  if (error) {
    redirect(`/courses?create=1&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/courses");
  redirect("/courses");
}
