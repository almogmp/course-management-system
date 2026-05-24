import type { SessionStatus } from "@/components/sessions/constants";

export function isSessionDelayed(
  sessionDate: string,
  startTime: string,
  status: SessionStatus,
  actualArrivalTime: string | null,
): boolean {
  if (status !== "planned") {
    return false;
  }

  if (actualArrivalTime) {
    return false;
  }

  const normalizedStart = startTime.length === 5 ? `${startTime}:00` : startTime;
  const plannedStart = new Date(`${sessionDate}T${normalizedStart}`);

  return plannedStart.getTime() < Date.now();
}
