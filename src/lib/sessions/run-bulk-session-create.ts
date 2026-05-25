import "server-only";

import { buildSessionInsert } from "@/lib/sessions/build-session-insert";
import {
  generateBulkSessionCandidates,
  partitionBulkCandidates,
} from "@/lib/sessions/bulk-generate";
import { fetchExistingSessionKeysForCourse } from "@/lib/sessions/get-existing-session-keys";
import type { BulkGenerationInput } from "@/lib/sessions/bulk-generate";
import type { ParsedBulkSessionForm } from "@/lib/sessions/parse-bulk-form";
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SessionSeriesInsert = Database["public"]["Tables"]["session_series"]["Insert"];

export type BulkSessionsPreviewData = {
  totalCandidates: number;
  toCreateCount: number;
  skippedDuplicateCount: number;
  skippedHolidayCount: number;
  sampleDates: string[];
};

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export async function previewBulkSessionsForCourse(
  supabase: SupabaseClient,
  courseId: string,
  parsed: ParsedBulkSessionForm,
  generation: BulkGenerationInput,
): Promise<BulkSessionsPreviewData> {
  const { candidates, skippedHolidayCount } = generateBulkSessionCandidates(generation);
  const existingKeys = await fetchExistingSessionKeysForCourse(
    supabase,
    courseId,
    parsed.startDate,
    parsed.endDate,
  );
  const { toCreate, skippedDuplicateCount } = partitionBulkCandidates(candidates, existingKeys);

  return {
    totalCandidates: candidates.length,
    toCreateCount: toCreate.length,
    skippedDuplicateCount,
    skippedHolidayCount,
    sampleDates: toCreate.slice(0, 8).map((item) => item.sessionDate),
  };
}

export async function previewBulkSessionsForNewCourse(
  generation: BulkGenerationInput,
): Promise<BulkSessionsPreviewData> {
  const { candidates, skippedHolidayCount } = generateBulkSessionCandidates(generation);
  const toCreate = candidates;

  return {
    totalCandidates: candidates.length,
    toCreateCount: toCreate.length,
    skippedDuplicateCount: 0,
    skippedHolidayCount,
    sampleDates: toCreate.slice(0, 8).map((item) => item.sessionDate),
  };
}

export type BulkSessionCreateResult = {
  createdCount: number;
  skippedDuplicateCount: number;
};

export async function runBulkSessionCreateForCourse(
  supabase: SupabaseClient,
  courseId: string,
  course: { school_year: string; lead_instructor_id: string },
  parsed: ParsedBulkSessionForm,
  generation: BulkGenerationInput,
): Promise<BulkSessionCreateResult | { error: string }> {
  const { candidates } = generateBulkSessionCandidates(generation);
  const existingKeys = await fetchExistingSessionKeysForCourse(
    supabase,
    courseId,
    parsed.startDate,
    parsed.endDate,
  );
  const { toCreate, skippedDuplicateCount } = partitionBulkCandidates(candidates, existingKeys);

  if (toCreate.length === 0) {
    return { createdCount: 0, skippedDuplicateCount };
  }

  const seriesPayload: SessionSeriesInsert = {
    course_id: courseId,
    start_date: parsed.startDate,
    end_date: parsed.endDate,
    weekdays: parsed.weekdays,
    start_time: parsed.startTime,
    end_time: parsed.endTime,
    assigned_instructor_id: parsed.assignedInstructorId,
    instructor_hours: parsed.instructorHours,
    company_hours: parsed.companyHours,
    default_status: parsed.status,
    institution_hourly_rate: parsed.institutionHourlyRate,
    instructor_hourly_rate: parsed.instructorHourlyRate,
  };

  const { data: series, error: seriesError } = await supabase
    .from("session_series")
    .insert(seriesPayload)
    .select("id")
    .single();

  if (seriesError || !series) {
    return { error: seriesError?.message ?? "יצירת סדרת מפגשים נכשלה." };
  }

  const sessionRows = toCreate.map((candidate) =>
    buildSessionInsert({
      courseId,
      schoolYear: course.school_year,
      leadInstructorId: course.lead_instructor_id,
      sessionDate: candidate.sessionDate,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
      instructorHours: parsed.instructorHours,
      companyHours: parsed.companyHours,
      status: parsed.status,
      assignedInstructorId: parsed.assignedInstructorId,
      institutionHourlyRate: parsed.institutionHourlyRate,
      instructorHourlyRate: parsed.instructorHourlyRate,
      seriesId: series.id,
    }),
  );

  const { error: insertError } = await supabase.from("sessions").insert(sessionRows);

  if (insertError) {
    await supabase.from("session_series").delete().eq("id", series.id);
    return { error: insertError.message };
  }

  return { createdCount: toCreate.length, skippedDuplicateCount };
}
