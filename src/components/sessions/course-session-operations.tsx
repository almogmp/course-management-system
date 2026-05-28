"use client";

import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import { SessionAdminRowActions } from "@/components/sessions/session-admin-row-actions";
import { SessionSimpleStatusSelect } from "@/components/sessions/session-simple-status-select";
import { SessionWorkflowActions } from "@/components/sessions/session-workflow-actions";
import { TABLE_ROW_ACTIONS_CLASS } from "@/components/ui/mobile-card-classes";
import { cn } from "@/lib/utils";

type CourseSessionOperationsProps = {
  courseId: string;
  session: CourseSessionListItem;
  sessionLabel: string;
  showAdminActions: boolean;
  isEditing: boolean;
  onEdit: (sessionId: string) => void;
  variant?: "card" | "table";
  includeStatusSelect?: boolean;
};

/**
 * כל פעולות שורת מפגש בקורס — משותף למובייל ולדסקטופ.
 */
export function CourseSessionOperations({
  courseId,
  session,
  sessionLabel,
  showAdminActions,
  isEditing,
  onEdit,
  variant = "table",
  includeStatusSelect = true,
}: CourseSessionOperationsProps) {
  const wrapClass =
    variant === "card"
      ? "flex w-full flex-col items-center justify-center gap-2 mobile-card-actions"
      : cn(TABLE_ROW_ACTIONS_CLASS, "mx-auto min-w-48 max-w-xs");

  return (
    <div className={cn(wrapClass, "app-table-actions")}>
      {includeStatusSelect ? (
        <SessionSimpleStatusSelect
          courseId={courseId}
          sessionId={session.id}
          currentStatus={session.status}
          mode={showAdminActions ? "admin" : "instructor"}
          sessionDate={session.session_date}
          startTime={session.start_time}
          compact={variant === "table"}
        />
      ) : null}
      <SessionAdminRowActions
        courseId={courseId}
        sessionId={session.id}
        sessionLabel={sessionLabel}
        isEditing={isEditing}
        onEdit={onEdit}
        variant={variant}
      />
      <SessionWorkflowActions
        courseId={courseId}
        session={session}
        showAdminActions={showAdminActions}
      />
    </div>
  );
}
