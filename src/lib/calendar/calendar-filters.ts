import type { SessionStatus } from "@/components/sessions/constants";
import type { WeeklyCalendarSession } from "@/components/calendar/types";
import type { DashboardSearchParams } from "@/lib/dashboard/dashboard-url";

export type CalendarFilterOptions = {
  instructors: Array<{ id: string; name: string }>;
  institutions: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; name: string }>;
  statuses: Array<{ value: SessionStatus; label: string }>;
};

export type CalendarFilters = {
  instructorId?: string;
  institutionId?: string;
  courseId?: string;
  status?: SessionStatus;
};

export function parseCalendarFilters(searchParams?: DashboardSearchParams): CalendarFilters {
  return {
    instructorId: searchParams?.filterInstructor || undefined,
    institutionId: searchParams?.filterInstitution || undefined,
    courseId: searchParams?.filterCourse || undefined,
    status: (searchParams?.filterStatus as SessionStatus | undefined) || undefined,
  };
}

export function applyCalendarFilters(
  sessions: WeeklyCalendarSession[],
  filters: CalendarFilters,
): WeeklyCalendarSession[] {
  return sessions.filter((session) => {
    if (filters.instructorId && session.instructor_id !== filters.instructorId) {
      return false;
    }

    if (filters.institutionId && session.institution_id !== filters.institutionId) {
      return false;
    }

    if (filters.courseId && session.course_id !== filters.courseId) {
      return false;
    }

    if (filters.status && session.status !== filters.status) {
      return false;
    }

    return true;
  });
}

export function hasActiveCalendarFilters(filters: CalendarFilters): boolean {
  return Boolean(
    filters.instructorId || filters.institutionId || filters.courseId || filters.status,
  );
}
