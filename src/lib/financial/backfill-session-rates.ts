import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseServerClient } from "@/lib/supabase/server";

export type BackfillSessionRatesResult = {
  institutionRatesUpdated: number;
  instructorRatesUpdated: number;
};

type SessionRateRow = {
  id: string;
  institution_hourly_rate: number | null;
  instructor_hourly_rate: number | null;
  courses: {
    company_hourly_rate: number;
    instructor_hourly_wage: number;
  } | null;
};

/**
 * Admin utility: copy course rates onto sessions where session rate is NULL.
 * Does not override manually stored session rates (including explicit 0).
 * Idempotent — safe to run multiple times.
 */
export async function backfillSessionRatesFromCourse(
  supabase?: SupabaseServerClient,
): Promise<BackfillSessionRatesResult> {
  const client = supabase ?? (await createServerSupabaseClient());

  const { data, error } = await client
    .from("sessions")
    .select(
      "id, institution_hourly_rate, instructor_hourly_rate, courses(company_hourly_rate, instructor_hourly_wage)",
    )
    .or("institution_hourly_rate.is.null,instructor_hourly_rate.is.null");

  if (error) {
    throw new Error(error.message);
  }

  let institutionRatesUpdated = 0;
  let instructorRatesUpdated = 0;

  for (const row of (data ?? []) as SessionRateRow[]) {
    const course = row.courses;
    if (!course) {
      continue;
    }

    const patch: {
      institution_hourly_rate?: number;
      instructor_hourly_rate?: number;
    } = {};

    if (row.institution_hourly_rate == null && course.company_hourly_rate > 0) {
      patch.institution_hourly_rate = course.company_hourly_rate;
      institutionRatesUpdated += 1;
    }

    if (row.instructor_hourly_rate == null && course.instructor_hourly_wage > 0) {
      patch.instructor_hourly_rate = course.instructor_hourly_wage;
      instructorRatesUpdated += 1;
    }

    if (Object.keys(patch).length === 0) {
      continue;
    }

    const { error: updateError } = await client.from("sessions").update(patch).eq("id", row.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  return { institutionRatesUpdated, instructorRatesUpdated };
}
