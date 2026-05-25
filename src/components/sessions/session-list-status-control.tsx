"use client";

import { SessionsListAdminStatusSelect } from "@/components/sessions/sessions-list-admin-status-select";
import { SessionStatusBadge } from "@/components/sessions/session-status-badge";
import type { SessionStatus } from "@/components/sessions/constants";

type SessionListStatusControlProps = {
  courseId: string;
  sessionId: string;
  status: SessionStatus;
  showAdminActions: boolean;
};

/** סטטוס מפגש — select למנהל, תג למדריך (משותף לדסקטופ ומובייל). */
export function SessionListStatusControl({
  courseId,
  sessionId,
  status,
  showAdminActions,
}: SessionListStatusControlProps) {
  if (showAdminActions) {
    return (
      <SessionsListAdminStatusSelect
        courseId={courseId}
        sessionId={sessionId}
        currentStatus={status}
      />
    );
  }

  return (
    <div className="flex justify-center">
      <SessionStatusBadge status={status} />
    </div>
  );
}
