import type { SessionStatus, SessionsListAdminStatusValue } from "@/components/sessions/constants";
import {
  SESSIONS_LIST_ADMIN_STATUS_OPTIONS,
  sessionsListToDbStatus,
} from "@/components/sessions/constants";

export type { SessionsListAdminStatusValue } from "@/components/sessions/constants";

export const INSTRUCTOR_STATUS_TOO_EARLY_ERROR = "מוקדם מדי לעדכן את סטטוס המפגש";

export const SIMPLE_SESSION_STATUS_OPTIONS = SESSIONS_LIST_ADMIN_STATUS_OPTIONS;

export function isSimpleManualSessionStatus(
  status: SessionStatus,
): status is SessionsListAdminStatusValue {
  return status === "planned" || status === "completed" || status === "cancelled";
}

export function parseSimpleSessionStatusInput(
  status: SessionStatus,
): SessionsListAdminStatusValue | null {
  if (!isSimpleManualSessionStatus(status)) {
    return null;
  }

  return status;
}

export function toDbSimpleSessionStatus(value: SessionsListAdminStatusValue): SessionStatus {
  return sessionsListToDbStatus(value);
}

/** Instructor may change status only after planned session start time. */
export function hasSessionStarted(sessionDate: string, startTime: string): boolean {
  const normalizedStart = startTime.length === 5 ? `${startTime}:00` : startTime;
  const sessionStart = new Date(`${sessionDate}T${normalizedStart}`);

  return sessionStart.getTime() <= Date.now();
}
