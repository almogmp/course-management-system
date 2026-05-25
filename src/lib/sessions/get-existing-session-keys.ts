import "server-only";

import { sessionOccurrenceKey } from "@/lib/sessions/bulk-generate";
import type { SupabaseServerClient } from "@/lib/supabase/server";

export async function fetchExistingSessionKeysForCourse(
  supabase: SupabaseServerClient,
  courseId: string,
  startDate: string,
  endDate: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("sessions")
    .select("session_date, start_time")
    .eq("course_id", courseId)
    .gte("session_date", startDate)
    .lte("session_date", endDate);

  if (error) {
    throw new Error(error.message);
  }

  const keys = new Set<string>();

  for (const row of data ?? []) {
    keys.add(sessionOccurrenceKey(row.session_date, row.start_time));
  }

  return keys;
}
