"use client";

import { useMemo, useState } from "react";

import { CourseSessionsFilters } from "@/components/sessions/course-sessions-filters";
import type { InstructorDashboardSession } from "@/components/dashboard/get-instructor-dashboard-data";
import { InstructorSessionsList } from "@/components/dashboard/instructor-sessions-list";
import type { SessionStatusFilter } from "@/components/sessions/constants";
import { toLocalDateKey } from "@/lib/date/week";

type InstructorSessionsSectionProps = {
  sessions: InstructorDashboardSession[];
};

function sortInstructorSessions(
  sessions: InstructorDashboardSession[],
): InstructorDashboardSession[] {
  const todayKey = toLocalDateKey(new Date());

  return [...sessions].sort((a, b) => {
    const aUpcoming = a.status === "planned" && a.session_date >= todayKey;
    const bUpcoming = b.status === "planned" && b.session_date >= todayKey;

    if (aUpcoming && !bUpcoming) {
      return -1;
    }

    if (!aUpcoming && bUpcoming) {
      return 1;
    }

    if (a.session_date !== b.session_date) {
      return a.session_date.localeCompare(b.session_date);
    }

    return a.start_time.localeCompare(b.start_time);
  });
}

export function InstructorSessionsSection({ sessions }: InstructorSessionsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<SessionStatusFilter>("all");

  const filteredSessions = useMemo(() => {
    const sorted = sortInstructorSessions(sessions);

    if (statusFilter === "all") {
      return sorted;
    }

    return sorted.filter((session) => session.status === statusFilter);
  }, [sessions, statusFilter]);

  if (sessions.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">המפגשים שלי</h2>
        <p className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center text-sm text-muted-foreground sm:text-base">
          אין לך מפגשים משובצים בחודש הנבחר.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">המפגשים שלי</h2>
        <CourseSessionsFilters value={statusFilter} onChange={setStatusFilter} />
      </div>

      {filteredSessions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-muted-foreground">
          אין מפגשים בסינון זה.
        </p>
      ) : (
        <InstructorSessionsList sessions={filteredSessions} />
      )}
    </section>
  );
}
