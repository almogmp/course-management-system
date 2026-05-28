"use client";

import { useMemo, useState } from "react";

import { CourseSessionsEmptyState } from "@/components/sessions/course-sessions-empty-state";
import { CourseSessionsFilters } from "@/components/sessions/course-sessions-filters";
import { CourseSessionsList } from "@/components/sessions/course-sessions-list";
import type { SessionStatusFilter } from "@/components/sessions/constants";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import type { InstructorSelectOption } from "@/lib/instructors/get-instructors-for-select";

type CourseSessionsManagementProps = {
  courseId: string;
  sessions: CourseSessionListItem[];
  instructors: InstructorSelectOption[];
  showAdminActions: boolean;
  courseInstitutionRate: number;
  courseInstructorRate: number;
};

export function CourseSessionsManagement({
  courseId,
  sessions,
  instructors,
  showAdminActions,
  courseInstitutionRate,
  courseInstructorRate,
}: CourseSessionsManagementProps) {
  const [statusFilter, setStatusFilter] = useState<SessionStatusFilter>("all");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const filteredSessions = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => {
      if (a.session_date !== b.session_date) {
        return a.session_date.localeCompare(b.session_date);
      }

      return a.start_time.localeCompare(b.start_time);
    });

    if (statusFilter === "all") {
      return sorted;
    }

    return sorted.filter((session) => session.status === statusFilter);
  }, [sessions, statusFilter]);

  if (sessions.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">מפגשים</h2>
        <CourseSessionsEmptyState />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">{sessions.length} מפגשים</h2>
        <CourseSessionsFilters value={statusFilter} onChange={setStatusFilter} />
      </div>

      {filteredSessions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-muted-foreground">
          אין מפגשים בסינון זה.
        </p>
      ) : (
        <CourseSessionsList
          courseId={courseId}
          sessions={filteredSessions}
          instructors={instructors}
          showAdminActions={showAdminActions}
          courseInstitutionRate={courseInstitutionRate}
          courseInstructorRate={courseInstructorRate}
          editingSessionId={editingSessionId}
          onEdit={setEditingSessionId}
          onCancelEdit={() => setEditingSessionId(null)}
          onEditSuccess={() => setEditingSessionId(null)}
        />
      )}
    </section>
  );
}
