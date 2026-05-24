"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];

const LEGACY_SCHOOL_YEAR = "—";

export async function createCourseAction(formData: FormData): Promise<void> {
  await requireAuth();

  const name = String(formData.get("name") ?? "").trim();
  const institutionId = String(formData.get("institution_id") ?? "").trim();
  const coordinatorId = String(formData.get("coordinator_id") ?? "").trim();
  const primarySupplierId = String(formData.get("primary_supplier_id") ?? "").trim();
  const leadInstructorId = String(formData.get("lead_instructor_id") ?? "").trim();
  const targetHoursRaw = String(formData.get("target_instructor_hours") ?? "").trim();

  if (!name || !institutionId || !coordinatorId || !primarySupplierId || !leadInstructorId) {
    redirect(
      `/courses?create=1&error=${encodeURIComponent("יש למלא את כל שדות החובה.")}`,
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data: coordinator, error: coordinatorError } = await supabase
    .from("institution_coordinators")
    .select("id, full_name, institution_id")
    .eq("id", coordinatorId)
    .maybeSingle();

  if (coordinatorError || !coordinator || coordinator.institution_id !== institutionId) {
    redirect(
      `/courses?create=1&error=${encodeURIComponent("יש לבחור רכז תקין מהמוסד שנבחר.")}`,
    );
  }

  const targetInstructorHours = targetHoursRaw ? Number(targetHoursRaw) : null;

  if (targetInstructorHours !== null && (Number.isNaN(targetInstructorHours) || targetInstructorHours < 0)) {
    redirect(
      `/courses?create=1&error=${encodeURIComponent("יעד שעות אינו תקין.")}`,
    );
  }

  const payload: CourseInsert = {
    name,
    institution_id: institutionId,
    coordinator: coordinator.full_name,
    coordinator_id: coordinator.id,
    primary_supplier_id: primarySupplierId,
    lead_instructor_id: leadInstructorId,
    status: "active",
    school_year: LEGACY_SCHOOL_YEAR,
    instructor_hourly_wage: 0,
    company_hourly_rate: 0,
    instructor_hours: 0,
    company_hours: 0,
    target_instructor_hours: targetInstructorHours,
  };

  const { error } = await supabase.from("courses").insert(payload);

  if (error) {
    redirect(`/courses?create=1&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/courses");
  redirect("/courses");
}
