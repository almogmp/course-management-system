import type { SessionStatus } from "@/components/sessions/constants";
import { formatSessionHours } from "@/components/sessions/format";

export type CourseHoursSummary = {
  totalSessions: number;
  totalInstructorHours: number;
  totalCompanyHours: number;
  completedInstructorHours: number;
  plannedInstructorHours: number;
  remainingInstructorHours: number | null;
  targetInstructorHours: number | null;
  exceedsTarget: boolean;
};

type SessionHoursInput = {
  status: SessionStatus;
  instructor_hours: number;
  company_hours: number;
};

export function computeCourseHoursSummary(
  sessions: SessionHoursInput[],
  targetInstructorHours: number | null,
): CourseHoursSummary {
  let totalInstructorHours = 0;
  let totalCompanyHours = 0;
  let completedInstructorHours = 0;
  let plannedInstructorHours = 0;

  for (const session of sessions) {
    totalInstructorHours += session.instructor_hours;
    totalCompanyHours += session.company_hours;

    if (session.status === "completed") {
      completedInstructorHours += session.instructor_hours;
    } else if (session.status !== "cancelled") {
      plannedInstructorHours += session.instructor_hours;
    }
  }

  const remainingInstructorHours =
    targetInstructorHours !== null
      ? Math.max(0, targetInstructorHours - plannedInstructorHours - completedInstructorHours)
      : null;

  const exceedsTarget =
    targetInstructorHours !== null &&
    plannedInstructorHours + completedInstructorHours > targetInstructorHours;

  return {
    totalSessions: sessions.length,
    totalInstructorHours,
    totalCompanyHours,
    completedInstructorHours,
    plannedInstructorHours,
    remainingInstructorHours,
    targetInstructorHours,
    exceedsTarget,
  };
}

export function formatHoursSummaryLine(hours: number): string {
  return formatSessionHours(hours);
}
