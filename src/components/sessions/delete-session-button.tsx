import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";

type DeleteSessionButtonProps = {
  courseId: string;
  sessionId: string;
  sessionLabel: string;
  returnPath?: string;
};

export function DeleteSessionButton({
  courseId,
  sessionId,
  sessionLabel,
  returnPath,
}: DeleteSessionButtonProps) {
  return (
    <AdminDeleteDialog
      entityType="session"
      entityId={sessionId}
      entityLabel={sessionLabel}
      returnPath={returnPath ?? `/courses/${courseId}/sessions`}
      courseId={courseId}
      triggerLabel="מחיקה"
      compact
    />
  );
}
