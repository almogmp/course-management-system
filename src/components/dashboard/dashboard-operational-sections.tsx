import Link from "next/link";

import type { OperationalDashboardData } from "@/components/dashboard/get-operational-dashboard-data";
import { AdminQuickStatusSelect } from "@/components/sessions/admin-quick-status-select";
import { SessionStatusBadge } from "@/components/sessions/session-status-badge";
import { formatSessionDate, formatSessionTimeRange } from "@/components/sessions/format";

type DashboardOperationalSectionsProps = {
  data: OperationalDashboardData;
  isAdmin: boolean;
};

function OperationalSessionList({
  sessions,
  isAdmin,
  emptyMessage,
  showQuickStatus = false,
}: {
  sessions: OperationalDashboardData["activeNowSessions"];
  isAdmin: boolean;
  emptyMessage: string;
  showQuickStatus?: boolean;
}) {
  if (sessions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

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
            <SessionStatusBadge status={session.status} isDelayed={session.is_delayed} />
            {showQuickStatus && isAdmin ? (
              <AdminQuickStatusSelect
                courseId={session.course_id}
                sessionId={session.id}
                currentStatus={session.status}
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
  const sections = [
    {
      id: "active-now",
      title: "מפגשים פעילים עכשיו",
      sessions: data.activeNowSessions,
      emptyMessage: "אין מפגשים פעילים כרגע.",
      showQuickStatus: true,
    },
    {
      id: "delayed-arrival",
      title: "מדריכים שלא אישרו הגעה",
      sessions: data.delayedArrivalSessions,
      emptyMessage: "אין מפגשים באיחור כרגע.",
      showQuickStatus: true,
    },
    {
      id: "completed-today",
      title: "מפגשים שהסתיימו היום",
      sessions: data.completedTodaySessions,
      emptyMessage: "אין מפגשים שסומנו כבוצעו היום.",
    },
    {
      id: "pending-approval",
      title: "מפגשים שממתינים לאישור",
      sessions: data.pendingApprovalSessions,
      emptyMessage: "אין מפגשים שממתינים לאישור.",
      showQuickStatus: true,
    },
  ] as const;

  return (
    <section aria-label="תפעול יומי" className="space-y-6">
      {sections.map((section) => (
        <div key={section.id} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
          <OperationalSessionList
            sessions={section.sessions}
            isAdmin={isAdmin}
            emptyMessage={section.emptyMessage}
            showQuickStatus={"showQuickStatus" in section ? section.showQuickStatus : false}
          />
        </div>
      ))}
    </section>
  );
}
