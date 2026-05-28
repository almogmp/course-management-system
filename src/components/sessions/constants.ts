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
  { value: "completed", label: "בוצע" },
  { value: "cancelled", label: "בוטל" },
];

/** ערכי select בטופס → enum במסד */
export const SESSION_FORM_STATUS_OPTIONS = [
  { value: "scheduled", label: "מתוכנן" },
  { value: "completed", label: "בוצע" },
  { value: "canceled", label: "בוטל" },
] as const;

export type SessionFormStatus = (typeof SESSION_FORM_STATUS_OPTIONS)[number]["value"];

const FORM_STATUS_TO_DB: Record<SessionFormStatus, SessionStatus> = {
  scheduled: "planned",
  completed: "completed",
  canceled: "cancelled",
};

export function mapFormStatusToDb(formStatus: string): SessionStatus | null {
  if (formStatus in FORM_STATUS_TO_DB) {
    return FORM_STATUS_TO_DB[formStatus as SessionFormStatus];
  }

  return null;
}

const DB_STATUS_TO_FORM: Record<SessionStatus, SessionFormStatus> = {
  planned: "scheduled",
  completed: "completed",
  cancelled: "canceled",
  arrived: "scheduled",
  in_progress: "scheduled",
  deferred: "scheduled",
};

export function mapDbStatusToForm(status: SessionStatus): SessionFormStatus {
  return DB_STATUS_TO_FORM[status];
}

export type SessionStatusFilter =
  | "all"
  | "planned"
  | "completed"
  | "cancelled";

export const SESSION_STATUS_FILTERS: { value: SessionStatusFilter; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "planned", label: "מתוכנן" },
  { value: "completed", label: "בוצע" },
  { value: "cancelled", label: "בוטל" },
];

export const PENDING_APPROVAL_STATUS: SessionStatus = "deferred";

export const ACTIVE_OPERATIONAL_STATUSES: SessionStatus[] = ["arrived", "in_progress"];

/** Simplified admin status control for global sessions list */
export type SessionsListAdminStatusValue =
  | "planned"
  | "completed"
  | "cancelled";

export const SESSIONS_LIST_ADMIN_STATUS_OPTIONS: Array<{
  value: SessionsListAdminStatusValue;
  label: string;
}> = [
  { value: "planned", label: "מתוכנן" },
  { value: "completed", label: "בוצע" },
  { value: "cancelled", label: "בוטל" },
];

export function sessionsListSelectValue(status: SessionStatus): SessionsListAdminStatusValue {
  if (status === "planned") {
    return "planned";
  }

  if (status === "completed") {
    return "completed";
  }

  if (status === "cancelled") {
    return "cancelled";
  }

  return "planned";
}

/** Bulk creation — default status options (form values) */
export const BULK_DEFAULT_STATUS_OPTIONS = [
  { value: "scheduled", label: "מתוכנן" },
] as const;

export type BulkDefaultStatus = (typeof BULK_DEFAULT_STATUS_OPTIONS)[number]["value"];

export const BULK_WEEKDAY_OPTIONS = [
  { value: 0, label: "ראשון" },
  { value: 1, label: "שני" },
  { value: 2, label: "שלישי" },
  { value: 3, label: "רביעי" },
  { value: 4, label: "חמישי" },
  { value: 5, label: "שישי" },
  { value: 6, label: "שבת" },
] as const;

export function mapBulkDefaultStatusToDb(formStatus: string): SessionStatus | null {
  if (formStatus === "scheduled") {
    return "planned";
  }

  return null;
}

export function sessionsListToDbStatus(value: SessionsListAdminStatusValue): SessionStatus {
  return value;
}
