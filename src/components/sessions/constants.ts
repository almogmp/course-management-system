import type { Database } from "@/types/database";

export type SessionStatus = Database["public"]["Enums"]["session_status"];

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  planned: "מתוכנן",
  arrived: "הגיע",
  in_progress: "בתהליך",
  completed: "בוצע",
  cancelled: "בוטל",
  deferred: "ממתין לאישור",
};

export const ADMIN_STATUS_OPTIONS: { value: SessionStatus; label: string }[] = [
  { value: "planned", label: "מתוכנן" },
  { value: "arrived", label: "הגיע" },
  { value: "in_progress", label: "בתהליך" },
  { value: "completed", label: "בוצע" },
  { value: "cancelled", label: "בוטל" },
  { value: "deferred", label: "ממתין לאישור" },
];

/** ערכי select בטופס → enum במסד */
export const SESSION_FORM_STATUS_OPTIONS = [
  { value: "scheduled", label: "מתוכנן" },
  { value: "arrived", label: "הגיע" },
  { value: "in_progress", label: "בתהליך" },
  { value: "completed", label: "בוצע" },
  { value: "canceled", label: "בוטל" },
  { value: "pending_approval", label: "ממתין לאישור" },
] as const;

export type SessionFormStatus = (typeof SESSION_FORM_STATUS_OPTIONS)[number]["value"];

const FORM_STATUS_TO_DB: Record<SessionFormStatus, SessionStatus> = {
  scheduled: "planned",
  arrived: "arrived",
  in_progress: "in_progress",
  completed: "completed",
  canceled: "cancelled",
  pending_approval: "deferred",
};

export function mapFormStatusToDb(formStatus: string): SessionStatus | null {
  if (formStatus in FORM_STATUS_TO_DB) {
    return FORM_STATUS_TO_DB[formStatus as SessionFormStatus];
  }

  return null;
}

const DB_STATUS_TO_FORM: Record<SessionStatus, SessionFormStatus> = {
  planned: "scheduled",
  arrived: "arrived",
  in_progress: "in_progress",
  completed: "completed",
  cancelled: "canceled",
  deferred: "pending_approval",
};

export function mapDbStatusToForm(status: SessionStatus): SessionFormStatus {
  return DB_STATUS_TO_FORM[status];
}

export type SessionStatusFilter =
  | "all"
  | "planned"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "deferred";

export const SESSION_STATUS_FILTERS: { value: SessionStatusFilter; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "planned", label: "מתוכנן" },
  { value: "arrived", label: "הגיע" },
  { value: "in_progress", label: "בתהליך" },
  { value: "completed", label: "בוצע" },
  { value: "cancelled", label: "בוטל" },
  { value: "deferred", label: "ממתין לאישור" },
];

export const PENDING_APPROVAL_STATUS: SessionStatus = "deferred";

export const ACTIVE_OPERATIONAL_STATUSES: SessionStatus[] = ["arrived", "in_progress"];
