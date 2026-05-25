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

/** Simplified admin status control for global sessions list */
export type SessionsListAdminStatusValue =
  | "planned"
  | "active"
  | "completed"
  | "cancelled"
  | "deferred";

export const SESSIONS_LIST_ADMIN_STATUS_OPTIONS: Array<{
  value: SessionsListAdminStatusValue;
  label: string;
}> = [
  { value: "planned", label: "מתוכנן" },
  { value: "active", label: "פעיל" },
  { value: "completed", label: "בוצע" },
  { value: "cancelled", label: "בוטל" },
  { value: "deferred", label: "נדחה" },
];

export function sessionsListSelectValue(status: SessionStatus): SessionsListAdminStatusValue {
  if (status === "arrived" || status === "in_progress") {
    return "active";
  }

  if (status === "planned") {
    return "planned";
  }

  if (status === "completed") {
    return "completed";
  }

  if (status === "cancelled") {
    return "cancelled";
  }

  return "deferred";
}

/** Bulk creation — default status options (form values) */
export const BULK_DEFAULT_STATUS_OPTIONS = [
  { value: "scheduled", label: "מתוכנן" },
  { value: "in_progress", label: "פעיל" },
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

  if (formStatus === "in_progress") {
    return "in_progress";
  }

  return null;
}

export function sessionsListToDbStatus(value: SessionsListAdminStatusValue): SessionStatus {
  if (value === "active") {
    return "in_progress";
  }

  return value;
}
