import Link from "next/link";

import { DeleteSessionButton } from "@/components/sessions/delete-session-button";
import { formatSessionDate } from "@/components/sessions/format";
import type { SessionListItem } from "@/components/sessions/get-sessions";
import { SessionListStatusControl } from "@/components/sessions/session-list-status-control";
import { MOBILE_CARD_ACTIONS_CLASS, TABLE_ROW_ACTIONS_CLASS } from "@/components/ui/mobile-card-classes";
import { cn } from "@/lib/utils";

type SessionGlobalListActionsProps = {
  session: SessionListItem;
  showAdminActions: boolean;
  listReturnPath: string;
  variant?: "card" | "table";
};

/**
 * פעולות רשימת מפגשים גלובלית (/sessions) — אותן פעולות בדסקטופ ובמובייל.
 */
export function SessionGlobalListActions({
  session,
  showAdminActions,
  listReturnPath,
  variant = "card",
}: SessionGlobalListActionsProps) {
  const sessionLabel = `${formatSessionDate(session.session_date)} · ${session.course_name}`;
  const wrapClass = variant === "card" ? MOBILE_CARD_ACTIONS_CLASS : TABLE_ROW_ACTIONS_CLASS;

  return (
    <div className={cn(wrapClass, "app-table-actions")}>
      <SessionListStatusControl
        courseId={session.course_id}
        sessionId={session.id}
        status={session.status}
        showAdminActions={showAdminActions}
      />
      <Link
        href={`/courses/${session.course_id}/sessions`}
        className="inline-flex min-h-10 w-full max-w-xs items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted md:w-auto"
      >
        פרטי קורס
      </Link>
      {showAdminActions ? (
        <DeleteSessionButton
          courseId={session.course_id}
          sessionId={session.id}
          sessionLabel={sessionLabel}
          returnPath={listReturnPath}
        />
      ) : null}
    </div>
  );
}
