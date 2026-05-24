import type { Database } from "@/types/database";

export type CourseStatus = Database["public"]["Enums"]["course_status"];

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  active: "פעיל",
  frozen: "מוקפא",
  ended: "הסתיים",
};
