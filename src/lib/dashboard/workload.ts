import type { SessionStatus } from "@/components/sessions/constants";

export type WorkloadSessionRecord = {
  status: SessionStatus;
  instructor_hours: number;
  company_hours: number;
};

export type MonthlyOverviewStats = {
  instructorHours: number;
  companyHours: number;
  completedCount: number;
  cancelledCount: number;
};

export type InstructorWorkloadRow = {
  instructorId: string;
  instructorName: string;
  sessionCount: number;
  instructorHours: number;
  companyHours: number;
  completedCount: number;
  plannedCount: number;
  cancelledCount: number;
  pendingApprovalCount: number;
};

export function computeMonthlyOverview(
  sessions: WorkloadSessionRecord[],
): MonthlyOverviewStats {
  return sessions.reduce<MonthlyOverviewStats>(
    (stats, session) => {
      stats.instructorHours += session.instructor_hours;
      stats.companyHours += session.company_hours;

      if (session.status === "completed") {
        stats.completedCount += 1;
      }

      if (session.status === "cancelled") {
        stats.cancelledCount += 1;
      }

      return stats;
    },
    {
      instructorHours: 0,
      companyHours: 0,
      completedCount: 0,
      cancelledCount: 0,
    },
  );
}

export function aggregateInstructorWorkload(
  entries: Array<{
    instructorId: string;
    instructorName: string;
    session: WorkloadSessionRecord;
  }>,
): InstructorWorkloadRow[] {
  const byInstructor = new Map<string, InstructorWorkloadRow>();

  for (const entry of entries) {
    const existing = byInstructor.get(entry.instructorId) ?? {
      instructorId: entry.instructorId,
      instructorName: entry.instructorName,
      sessionCount: 0,
      instructorHours: 0,
      companyHours: 0,
      completedCount: 0,
      plannedCount: 0,
      cancelledCount: 0,
      pendingApprovalCount: 0,
    };

    existing.sessionCount += 1;
    existing.instructorHours += entry.session.instructor_hours;
    existing.companyHours += entry.session.company_hours;

    if (entry.session.status === "completed") {
      existing.completedCount += 1;
    }

    if (entry.session.status === "planned") {
      existing.plannedCount += 1;
    }

    if (entry.session.status === "cancelled") {
      existing.cancelledCount += 1;
    }

    if (entry.session.status === "deferred") {
      existing.pendingApprovalCount += 1;
    }

    byInstructor.set(entry.instructorId, existing);
  }

  return Array.from(byInstructor.values()).sort(
    (a, b) => b.instructorHours - a.instructorHours,
  );
}

export function computeInstructorMonthlyWorkload(
  sessions: WorkloadSessionRecord[],
): Omit<InstructorWorkloadRow, "instructorId" | "instructorName"> {
  const row: InstructorWorkloadRow = {
    instructorId: "",
    instructorName: "",
    sessionCount: sessions.length,
    instructorHours: 0,
    companyHours: 0,
    completedCount: 0,
    plannedCount: 0,
    cancelledCount: 0,
    pendingApprovalCount: 0,
  };

  for (const session of sessions) {
    row.instructorHours += session.instructor_hours;
    row.companyHours += session.company_hours;

    if (session.status === "completed") {
      row.completedCount += 1;
    }

    if (session.status === "planned") {
      row.plannedCount += 1;
    }

    if (session.status === "cancelled") {
      row.cancelledCount += 1;
    }

    if (session.status === "deferred") {
      row.pendingApprovalCount += 1;
    }
  }

  return row;
}
