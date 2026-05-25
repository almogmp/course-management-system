import "server-only";

import { BULK_WEEKDAY_OPTIONS, SESSION_STATUS_LABELS } from "@/components/sessions/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type CourseSessionSeriesListItem = {
  id: string;
  startDate: string;
  endDate: string;
  weekdaysLabel: string;
  startTime: string;
  endTime: string;
  defaultStatusLabel: string;
  sessionCount: number;
};

type SeriesRow = Database["public"]["Tables"]["session_series"]["Row"];

function formatWeekdays(weekdays: number[]): string {
  const labels = BULK_WEEKDAY_OPTIONS.filter((option) => weekdays.includes(option.value)).map(
    (option) => option.label,
  );

  return labels.join(", ");
}

export async function getCourseSessionSeries(courseId: string): Promise<CourseSessionSeriesListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data: seriesRows, error: seriesError } = await supabase
    .from("session_series")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (seriesError) {
    throw new Error(seriesError.message);
  }

  if (!seriesRows?.length) {
    return [];
  }

  const seriesIds = seriesRows.map((row) => row.id);
  const { data: sessionCounts, error: countError } = await supabase
    .from("sessions")
    .select("series_id")
    .in("series_id", seriesIds);

  if (countError) {
    throw new Error(countError.message);
  }

  const countBySeries = new Map<string, number>();

  for (const row of sessionCounts ?? []) {
    if (!row.series_id) {
      continue;
    }

    countBySeries.set(row.series_id, (countBySeries.get(row.series_id) ?? 0) + 1);
  }

  return (seriesRows as SeriesRow[]).map((row) => ({
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    weekdaysLabel: formatWeekdays(row.weekdays),
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    defaultStatusLabel: SESSION_STATUS_LABELS[row.default_status],
    sessionCount: countBySeries.get(row.id) ?? 0,
  }));
}
