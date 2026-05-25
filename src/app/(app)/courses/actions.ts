"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireAuth } from "@/lib/auth/guards";
import { parseRequiredRate } from "@/lib/financial/parse-rates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];

const LEGACY_SCHOOL_YEAR = "—";

export async function createCourseAction(formData: FormData): Promise<void> {
  await requireAuth();

  const name = String(formData.get("name") ?? "").trim();
  const institutionId = String(formData.get("institution_id") ?? "").trim();
  const coordinatorId = String(formData.get("coordinator_id") ?? "").trim();
  let primarySupplierId = String(formData.get("primary_supplier_id") ?? "").trim();
  const leadInstructorId = String(formData.get("lead_instructor_id") ?? "").trim();
  const targetHoursRaw = String(formData.get("target_instructor_hours") ?? "").trim();
  const institutionRateRaw = String(formData.get("institution_hourly_rate") ?? "").trim();
  const instructorRateRaw = String(formData.get("instructor_hourly_rate") ?? "").trim();

  if (!name || !institutionId || !coordinatorId || !leadInstructorId) {
    redirect(
      `/courses?create=1&error=${encodeURIComponent("יש למלא את כל שדות החובה.")}`,
    );
  }

  const supabase = await createServerSupabaseClient();

  if (!primarySupplierId) {
    const { data: institution } = await supabase
      .from("institutions")
      .select("primary_supplier_id, is_own_supplier")
      .eq("id", institutionId)
      .maybeSingle();

    if (institution?.primary_supplier_id && !institution.is_own_supplier) {
      primarySupplierId = institution.primary_supplier_id;
    }
  }

  if (!primarySupplierId) {
    redirect(
      `/courses?create=1&error=${encodeURIComponent("יש לבחור ספק לקורס.")}`,
    );
  }

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

  const institutionRate = parseRequiredRate(institutionRateRaw, "מחיר לשעה מהמוסד");
  if (!institutionRate.ok) {
    redirect(`/courses?create=1&error=${encodeURIComponent(institutionRate.error)}`);
  }

  const instructorRate = parseRequiredRate(instructorRateRaw, "שכר מדריך לשעה");
  if (!instructorRate.ok) {
    redirect(`/courses?create=1&error=${encodeURIComponent(instructorRate.error)}`);
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
    instructor_hourly_wage: instructorRate.value,
    company_hourly_rate: institutionRate.value,
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

export async function updateCourseRatesAction(
  courseId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const institutionRateRaw = String(formData.get("institution_hourly_rate") ?? "").trim();
  const instructorRateRaw = String(formData.get("instructor_hourly_rate") ?? "").trim();

  const institutionRate = parseRequiredRate(institutionRateRaw, "מחיר לשעה מהמוסד");
  if (!institutionRate.ok) {
    redirect(
      `/courses/${courseId}/sessions?error=${encodeURIComponent(institutionRate.error)}`,
    );
  }

  const instructorRate = parseRequiredRate(instructorRateRaw, "שכר מדריך לשעה");
  if (!instructorRate.ok) {
    redirect(
      `/courses/${courseId}/sessions?error=${encodeURIComponent(instructorRate.error)}`,
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("courses")
    .update({
      company_hourly_rate: institutionRate.value,
      instructor_hourly_wage: instructorRate.value,
    })
    .eq("id", courseId);

  if (error) {
    redirect(`/courses/${courseId}/sessions?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/courses/${courseId}/sessions`);
  redirect(`/courses/${courseId}/sessions?success=rates_updated`);
}
