"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { buildSessionInsert } from "@/lib/sessions/build-session-insert";
import {
  generateBulkSessionCandidates,
  partitionBulkCandidates,
  type BulkGenerationInput,
} from "@/lib/sessions/bulk-generate";
import { fetchExistingSessionKeysForCourse } from "@/lib/sessions/get-existing-session-keys";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SessionSeriesRow = Database["public"]["Tables"]["session_series"]["Row"];

export type SeriesActionResult = { ok: boolean; error?: string; message?: string };

function courseSessionsPath(courseId: string) {
  return `/courses/${courseId}/sessions`;
}

async function loadSeries(seriesId: string): Promise<SessionSeriesRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("session_series")
    .select("*")
    .eq("id", seriesId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function createMissingSessionsForSeries(
  series: SessionSeriesRow,
  rangeStart: string,
  rangeEnd: string,
): Promise<{ created: number; skipped: number }> {
  const supabase = await createServerSupabaseClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, school_year, lead_instructor_id")
    .eq("id", series.course_id)
    .maybeSingle();

  if (courseError || !course?.lead_instructor_id) {
    throw new Error(courseError?.message ?? "קורס לא נמצא.");
  }

  const generation: BulkGenerationInput = {
    startDate: rangeStart,
    endDate: rangeEnd,
    weekdays: series.weekdays,
    startTime: series.start_time,
    endTime: series.end_time,
  };

  const { candidates } = generateBulkSessionCandidates(generation);
  const existingKeys = await fetchExistingSessionKeysForCourse(
    supabase,
    series.course_id,
    rangeStart,
    rangeEnd,
  );
  const { toCreate, skippedDuplicateCount } = partitionBulkCandidates(candidates, existingKeys);

  if (toCreate.length === 0) {
    return { created: 0, skipped: skippedDuplicateCount };
  }

  const rows = toCreate.map((candidate) =>
    buildSessionInsert({
      courseId: series.course_id,
      schoolYear: course.school_year,
      leadInstructorId: course.lead_instructor_id!,
      sessionDate: candidate.sessionDate,
      startTime: candidate.startTime,
      endTime: candidate.endTime,
      instructorHours: series.instructor_hours,
      companyHours: series.company_hours,
      status: series.default_status,
      assignedInstructorId: series.assigned_instructor_id,
      institutionHourlyRate: series.institution_hourly_rate,
      instructorHourlyRate: series.instructor_hourly_rate,
      seriesId: series.id,
    }),
  );

  const { error } = await supabase.from("sessions").insert(rows);

  if (error) {
    throw new Error(error.message);
  }

  return { created: toCreate.length, skipped: skippedDuplicateCount };
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function updateSessionSeriesDatesAction(
  seriesId: string,
  formData: FormData,
): Promise<SeriesActionResult> {
  await requireAdmin();

  const newStart = String(formData.get("start_date") ?? "").trim();
  const newEnd = String(formData.get("end_date") ?? "").trim();
  const shortenMode = String(formData.get("shorten_mode") ?? "delete").trim();

  if (!newStart || !newEnd) {
    return { ok: false, error: "יש לבחור תאריך התחלה וסיום." };
  }

  if (newEnd < newStart) {
    return { ok: false, error: "תאריך הסיום חייב להיות אחרי תאריך ההתחלה." };
  }

  const series = await loadSeries(seriesId);

  if (!series) {
    return { ok: false, error: "הסדרה לא נמצאה." };
  }

  const supabase = await createServerSupabaseClient();
  let created = 0;
  let skipped = 0;

  if (newStart < series.start_date) {
    const rangeEnd = addDays(series.start_date, -1);
    const result = await createMissingSessionsForSeries(series, newStart, rangeEnd);
    created += result.created;
    skipped += result.skipped;
  }

  if (newEnd > series.end_date) {
    const rangeStart = addDays(series.end_date, 1);
    const result = await createMissingSessionsForSeries(series, rangeStart, newEnd);
    created += result.created;
    skipped += result.skipped;
  }

  if (newEnd < series.end_date) {
    const afterEnd = addDays(newEnd, 1);

    if (shortenMode === "cancel") {
      const { error } = await supabase
        .from("sessions")
        .update({
          status: "cancelled",
          cancellation_reason: "בוטל בעקבות קיצור סדרת מפגשים",
        })
        .eq("series_id", seriesId)
        .gte("session_date", afterEnd);

      if (error) {
        return { ok: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("series_id", seriesId)
        .gte("session_date", afterEnd);

      if (error) {
        return { ok: false, error: error.message };
      }
    }
  }

  const { error: updateError } = await supabase
    .from("session_series")
    .update({ start_date: newStart, end_date: newEnd })
    .eq("id", seriesId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  revalidatePath(courseSessionsPath(series.course_id));

  return {
    ok: true,
    message: `סדרה עודכנה. נוספו ${created} מפגשים, ${skipped} דולגו כפולים.`,
  };
}

export async function deleteSessionSeriesAction(seriesId: string): Promise<SeriesActionResult> {
  await requireAdmin();

  const series = await loadSeries(seriesId);

  if (!series) {
    return { ok: false, error: "הסדרה לא נמצאה." };
  }

  const supabase = await createServerSupabaseClient();

  const { error: sessionsError } = await supabase
    .from("sessions")
    .delete()
    .eq("series_id", seriesId);

  if (sessionsError) {
    return { ok: false, error: sessionsError.message };
  }

  const { error: seriesError } = await supabase.from("session_series").delete().eq("id", seriesId);

  if (seriesError) {
    return { ok: false, error: seriesError.message };
  }

  revalidatePath(courseSessionsPath(series.course_id));

  return { ok: true, message: "כל מפגשי הסדרה נמחקו." };
}
