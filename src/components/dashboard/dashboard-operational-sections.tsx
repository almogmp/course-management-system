import Link from "next/link";

import type { OperationalDashboardData } from "@/components/dashboard/get-operational-dashboard-data";
import { SessionSimpleStatusSelect } from "@/components/sessions/session-simple-status-select";
import { formatSessionDate, formatSessionTimeRange } from "@/components/sessions/format";

type DashboardOperationalSectionsProps = {
  data: OperationalDashboardData;
  isAdmin: boolean;
};

function PendingApprovalSessionList({
  sessions,
  isAdmin,
}: {
  sessions: OperationalDashboardData["pendingApprovalSessions"];
  isAdmin: boolean;
}) {
  return (
    <ul className="space-y-2">
      {sessions.map((session) => (
        <li
          key={session.id}
          className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-background p-3 text-start sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-medium text-foreground">
              {session.course_name ?? "ללא שם קורס"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatSessionDate(session.session_date)}
              {" · "}
              <span dir="ltr">{formatSessionTimeRange(session.start_time, session.end_time)}</span>
            </p>
            {session.cancellation_reason ? (
              <p className="text-xs text-muted-foreground">{session.cancellation_reason}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {isAdmin ? (
              <SessionSimpleStatusSelect
                courseId={session.course_id}
                sessionId={session.id}
                currentStatus={session.status}
                mode="admin"
                sessionDate={session.session_date}
                startTime={session.start_time}
                compact
              />
            ) : null}
            <Link
              href={`/courses/${session.course_id}/sessions`}
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              {isAdmin ? "לניהול" : "פרטים"}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DashboardOperationalSections({
  data,
  isAdmin,
}: DashboardOperationalSectionsProps) {
  if (data.pendingApprovalSessions.length === 0) {
    return null;
  }

  return (
    <section aria-label="מפגשים שממתינים לאישור" className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">מפגשים שממתינים לאישור</h2>
      <PendingApprovalSessionList sessions={data.pendingApprovalSessions} isAdmin={isAdmin} />
    </section>
  );
}
