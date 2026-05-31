"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { parseCombinedCourseWithSessionsForm } from "@/lib/courses/parse-combined-course-bulk-form";
import { resolveCoordinatorForInstitution } from "@/lib/courses/resolve-coordinator";
import { instructorExists } from "@/lib/instructors/get-instructors-for-select";
import { parseSchoolYearFromForm } from "@/lib/school-year-form";
import {
  previewBulkSessionsForNewCourse,
  runBulkSessionCreateForCourse,
} from "@/lib/sessions/run-bulk-session-create";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];

export type CombinedCourseSessionsPreview = {
  totalCandidates: number;
  toCreateCount: number;
  skippedDuplicateCount: number;
  skippedHolidayCount: number;
  sampleDates: string[];
  courseName: string;
};

export type CombinedCourseSessionsActionResult = {
  ok: boolean;
  error?: string;
  createdCount?: number;
  skippedDuplicateCount?: number;
  courseId?: string;
  preview?: CombinedCourseSessionsPreview;
};

export async function previewCombinedCourseWithSessionsAction(
  formData: FormData,
): Promise<CombinedCourseSessionsActionResult> {
  await requireAdmin();

  const parsed = parseCombinedCourseWithSessionsForm(formData);

  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const preview = await previewBulkSessionsForNewCourse(parsed.data.generation);

  return {
    ok: true,
    preview: {
      ...preview,
      courseName: parsed.data.course.name,
    },
  };
}

export async function createCombinedCourseWithSessionsAction(
  formData: FormData,
): Promise<CombinedCourseSessionsActionResult> {
  await requireAdmin();

  const parsed = parseCombinedCourseWithSessionsForm(formData);

  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const supabase = await createServerSupabaseClient();

  const { data: institution, error: institutionError } = await supabase
    .from("institutions")
    .select("id, primary_supplier_id, is_own_supplier, is_active")
    .eq("id", parsed.data.course.institutionId)
    .maybeSingle();

  if (institutionError) {
    return { ok: false, error: institutionError.message };
  }

  if (!institution?.is_active) {
    return { ok: false, error: "המוסד שנבחר אינו פעיל." };
  }

  if (
    institution.primary_supplier_id &&
    !institution.is_own_supplier &&
    institution.primary_supplier_id !== parsed.data.course.primarySupplierId
  ) {
    return { ok: false, error: "הספק שנבחר אינו תואם למוסד." };
  }

  const instructorIsValid = await instructorExists(supabase, parsed.data.course.leadInstructorId);

  if (!instructorIsValid) {
    return { ok: false, error: "המדריך שנבחר אינו פעיל במערכת." };
  }

  const coordinator = await resolveCoordinatorForInstitution(
    supabase,
    parsed.data.course.institutionId,
  );

  if (!coordinator.ok) {
    return { ok: false, error: coordinator.error };
  }

  const coursePayload: CourseInsert = {
    name: parsed.data.course.name,
    institution_id: parsed.data.course.institutionId,
    coordinator: coordinator.fullName,
    coordinator_id: coordinator.id,
    primary_supplier_id: parsed.data.course.primarySupplierId,
    lead_instructor_id: parsed.data.course.leadInstructorId,
    status: "active",
    school_year: parseSchoolYearFromForm(formData),
    instructor_hourly_wage: parsed.data.course.instructorHourlyRate,
    company_hourly_rate: parsed.data.course.institutionHourlyRate,
    instructor_hours: 0,
    company_hours: 0,
    target_instructor_hours: null,
  };

  const { data: createdCourse, error: courseError } = await supabase
    .from("courses")
    .insert(coursePayload)
    .select("id, school_year, lead_instructor_id")
    .single();

  if (courseError || !createdCourse?.lead_instructor_id) {
    return { ok: false, error: courseError?.message ?? "יצירת הקורס נכשלה." };
  }

  const bulkResult = await runBulkSessionCreateForCourse(
    supabase,
    createdCourse.id,
    {
      school_year: createdCourse.school_year,
      lead_instructor_id: createdCourse.lead_instructor_id,
    },
    parsed.data.bulk,
    parsed.data.generation,
  );

  if ("error" in bulkResult) {
    await supabase.from("courses").delete().eq("id", createdCourse.id);
    return { ok: false, error: bulkResult.error };
  }

  const coursePath = `/courses/${createdCourse.id}/sessions`;

  revalidatePath("/courses");
  revalidatePath(coursePath);
  revalidatePath("/sessions");
  revalidatePath("/dashboard");

  return {
    ok: true,
    courseId: createdCourse.id,
    createdCount: bulkResult.createdCount,
    skippedDuplicateCount: bulkResult.skippedDuplicateCount,
  };
}
