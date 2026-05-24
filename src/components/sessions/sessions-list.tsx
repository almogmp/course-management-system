import { SessionStatusBadge } from "@/components/sessions/session-status-badge";
import {
  formatSessionDate,
  formatSessionTimeRange,
} from "@/components/sessions/format";
import type { SessionListItem } from "@/components/sessions/get-sessions";

type SessionsListProps = {
  sessions: SessionListItem[];
};

export function SessionsList({ sessions }: SessionsListProps) {
  return (
    <>
      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="rounded-xl border border-border bg-surface p-4 text-start"
          >
            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {formatSessionDate(session.session_date)}
                </p>
                <p className="text-sm text-muted-foreground" dir="ltr">
                  {formatSessionTimeRange(session.start_time, session.end_time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {session.course_name ?? "ללא קורס"}
                </p>
              </div>
              <SessionStatusBadge status={session.status} />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="w-full min-w-[640px] text-start text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                תאריך
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                שעות
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                קורס
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                סטטוס
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">
                  {formatSessionDate(session.session_date)}
                </td>
                <td className="px-4 py-3 text-muted-foreground" dir="ltr">
                  {formatSessionTimeRange(session.start_time, session.end_time)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {session.course_name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <SessionStatusBadge status={session.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
