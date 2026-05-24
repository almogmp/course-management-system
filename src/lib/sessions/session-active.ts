import type { SessionStatus } from "@/components/sessions/constants";
import { toLocalDateKey } from "@/lib/date/week";

function normalizeTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

/** Session is active when current time is within planned window and not cancelled/completed. */
export function isSessionActiveNow(
  sessionDate: string,
  startTime: string,
  endTime: string,
  status: SessionStatus,
  now: Date = new Date(),
): boolean {
  if (status === "cancelled" || status === "completed") {
    return false;
  }

  const todayKey = toLocalDateKey(now);

  if (sessionDate !== todayKey) {
    return false;
  }

  const start = new Date(`${sessionDate}T${normalizeTime(startTime)}`);
  const end = new Date(`${sessionDate}T${normalizeTime(endTime)}`);

  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
}
