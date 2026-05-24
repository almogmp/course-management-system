import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

import type { SessionStatus } from "@/components/sessions/constants";

export type SessionListItem = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  course_name: string | null;
};

type SessionQueryRow = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  courses: Pick<Database["public"]["Tables"]["courses"]["Row"], "name"> | null;
};

export async function getSessions(): Promise<SessionListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("id, session_date, start_time, end_time, status, courses(name)")
    .order("session_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as SessionQueryRow[];

  return rows.map((row) => ({
    id: row.id,
    session_date: row.session_date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    course_name: row.courses?.name ?? null,
  }));
}
