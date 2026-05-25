"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { instructorExists } from "@/lib/instructors/get-instructors-for-select";
import { parseBulkSessionForm } from "@/lib/sessions/parse-bulk-form";
import {
  previewBulkSessionsForCourse,
  runBulkSessionCreateForCourse,
} from "@/lib/sessions/run-bulk-session-create";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type BulkSessionsPreviewResult = {
  ok: true;
  totalCandidates: number;
  toCreateCount: number;
  skippedDuplicateCount: number;
  skippedHolidayCount: number;
  sampleDates: string[];
};

export type BulkSessionsActionResult = {
  ok: boolean;
  error?: string;
  createdCount?: number;
  skippedDuplicateCount?: number;
  preview?: BulkSessionsPreviewResult;
};

function courseSessionsPath(courseId: string) {
  return `/courses/${courseId}/sessions`;
}

export async function previewBulkSessionsAction(
  courseId: string,
  formData: FormData,
): Promise<BulkSessionsActionResult> {
  await requireAdmin();

  if (!courseId.trim()) {
    return { ok: false, error: "מזהה קורס חסר." };
  }

  const parsed = parseBulkSessionForm(formData);

  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const supabase = await createServerSupabaseClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    return { ok: false, error: courseError.message };
  }

  if (!course) {
    return { ok: false, error: "הקורס לא נמצא." };
  }

  const preview = await previewBulkSessionsForCourse(
    supabase,
    courseId,
    parsed.data,
    parsed.generation,
  );

  return {
    ok: true,
    preview: {
      ok: true,
      ...preview,
    },
  };
}

export async function createBulkSessionsAction(
  courseId: string,
  formData: FormData,
): Promise<BulkSessionsActionResult> {
  await requireAdmin();

  if (!courseId.trim()) {
    return { ok: false, error: "מזהה קורס חסר." };
  }

  const parsed = parseBulkSessionForm(formData);

  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const supabase = await createServerSupabaseClient();
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, school_year, lead_instructor_id")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    return { ok: false, error: courseError.message };
  }

  if (!course?.lead_instructor_id) {
    return { ok: false, error: "לקורס חסר מדריך מוביל." };
  }

  const instructorIsValid = await instructorExists(supabase, parsed.data.assignedInstructorId);

  if (!instructorIsValid) {
    return { ok: false, error: "המדריך שנבחר אינו קיים במערכת." };
  }

  const bulkResult = await runBulkSessionCreateForCourse(
    supabase,
    courseId,
    {
      school_year: course.school_year,
      lead_instructor_id: course.lead_instructor_id,
    },
    parsed.data,
    parsed.generation,
  );

  if ("error" in bulkResult) {
    return { ok: false, error: bulkResult.error };
  }

  revalidatePath(courseSessionsPath(courseId));
  revalidatePath("/sessions");
  revalidatePath("/dashboard");

  return {
    ok: true,
    createdCount: bulkResult.createdCount,
    skippedDuplicateCount: bulkResult.skippedDuplicateCount,
  };
}
