"use client";

import { AdminQuickStatusSelect } from "@/components/sessions/admin-quick-status-select";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import { SessionAdminRowActions } from "@/components/sessions/session-admin-row-actions";
import { SessionSimpleActions } from "@/components/sessions/session-simple-actions";
import { SessionWorkflowActions } from "@/components/sessions/session-workflow-actions";
import { TABLE_ROW_ACTIONS_CLASS } from "@/components/ui/mobile-card-classes";
import { cn } from "@/lib/utils";

type CourseSessionOperationsProps = {
  courseId: string;
  session: CourseSessionListItem;
  sessionLabel: string;
  showAdminActions: boolean;
  currentInstructorId: string | null;
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
  currentInstructorId,
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
      {showAdminActions && includeStatusSelect ? (
        <AdminQuickStatusSelect
          courseId={courseId}
          sessionId={session.id}
          currentStatus={session.status}
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
        currentInstructorId={currentInstructorId}
      />
      <SessionSimpleActions
        courseId={courseId}
        session={session}
        currentInstructorId={currentInstructorId}
      />
    </div>
  );
}
