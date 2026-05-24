import type { SessionStatus } from "@/components/sessions/constants";

export function hasSessionEnded(sessionDate: string, endTime: string): boolean {
  const normalizedEnd = endTime.length === 5 ? `${endTime}:00` : endTime;
  const sessionEnd = new Date(`${sessionDate}T${normalizedEnd}`);

  return sessionEnd.getTime() <= Date.now();
}

export function instructorOwnsSession(
  assignedInstructorId: string,
  currentInstructorId: string | null,
): boolean {
  return Boolean(currentInstructorId && assignedInstructorId === currentInstructorId);
}

export function canInstructorMarkCompleted(
  status: SessionStatus,
  sessionDate: string,
  endTime: string,
  ownsSession: boolean,
): boolean {
  if (!ownsSession || status === "completed" || status === "cancelled") {
    return false;
  }

  return hasSessionEnded(sessionDate, endTime);
}

export function canInstructorMarkCancelled(
  status: SessionStatus,
  ownsSession: boolean,
): boolean {
  return ownsSession && status !== "cancelled" && status !== "completed";
}

export function canAdminApproveCancellation(status: SessionStatus): boolean {
  return status === "deferred";
}

export function canAdminReturnToPlanned(status: SessionStatus): boolean {
  return status === "deferred" || status === "cancelled";
}

export function canAdminMarkCompleted(status: SessionStatus): boolean {
  return status !== "completed" && status !== "in_progress" && status !== "arrived";
}
