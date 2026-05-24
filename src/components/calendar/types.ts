import type { SessionStatus } from "@/components/sessions/constants";

export type WeeklyCalendarSession = {
  id: string;
  course_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: SessionStatus;
  instructor_hours: number;
  company_hours: number | null;
  course_name: string | null;
  institution_id: string | null;
  institution_name: string | null;
  instructor_id: string | null;
  instructor_name: string | null;
  admin_note: string | null;
  actual_arrival_time: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  is_delayed: boolean;
};
