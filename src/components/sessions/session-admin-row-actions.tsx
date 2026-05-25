"use client";

import { DeleteSessionButton } from "@/components/sessions/delete-session-button";
import { MOBILE_CARD_ACTIONS_CLASS, TABLE_ROW_ACTIONS_CLASS } from "@/components/ui/mobile-card-classes";
import { cn } from "@/lib/utils";

type SessionAdminRowActionsProps = {
  courseId: string;
  sessionId: string;
  sessionLabel: string;
  isEditing: boolean;
  onEdit: (sessionId: string) => void;
  variant?: "card" | "table";
};

/** עריכה + מחיקה למנהל — משותף לכרטיס מובייל ולתא טבלה. */
export function SessionAdminRowActions({
  courseId,
  sessionId,
  sessionLabel,
  isEditing,
  onEdit,
  variant = "table",
}: SessionAdminRowActionsProps) {
  if (isEditing) {
    return null;
  }

  const wrapClass = variant === "card" ? MOBILE_CARD_ACTIONS_CLASS : TABLE_ROW_ACTIONS_CLASS;

  return (
    <div className={cn(wrapClass, "app-table-actions")}>
      <button
        type="button"
        onClick={() => onEdit(sessionId)}
        className="inline-flex min-h-10 w-full max-w-xs items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted md:min-h-9 md:w-auto md:max-w-none md:px-3"
      >
        עריכה
      </button>
      <DeleteSessionButton
        courseId={courseId}
        sessionId={sessionId}
        sessionLabel={sessionLabel}
      />
    </div>
  );
}
