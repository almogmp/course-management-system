import { SessionStatusBadge } from "@/components/sessions/session-status-badge";
import {
  formatSessionDate,
  formatSessionHours,
  formatSessionTimeRange,
} from "@/components/sessions/format";
import type { InstructorDashboardSession } from "@/components/dashboard/get-instructor-dashboard-data";

type InstructorSessionsListProps = {
  sessions: InstructorDashboardSession[];
};

export function InstructorSessionsList({ sessions }: InstructorSessionsListProps) {
  return (
    <>
      <ul className="space-y-3 md:hidden">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="rounded-xl border border-border bg-surface p-4 text-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-full space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {formatSessionDate(session.session_date)}
                </p>
                <p className="text-sm text-muted-foreground" dir="ltr">
                  {formatSessionTimeRange(session.start_time, session.end_time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {session.course_name ?? "ללא שם קורס"}
                </p>
                {session.institution_name ? (
                  <p className="text-sm text-muted-foreground">{session.institution_name}</p>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">שעות מדריך: </span>
                {formatSessionHours(session.instructor_hours)}
              </p>
              {session.notes ? (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">הערות: </span>
                  {session.notes}
                </p>
              ) : null}
              <SessionStatusBadge status={session.status} />
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="app-table w-full min-w-[880px] text-sm">
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
                מוסד
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                סטטוס
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                שעות מדריך
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                הערות
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
                <td className="px-4 py-3 text-muted-foreground">
                  {session.institution_name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <SessionStatusBadge status={session.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatSessionHours(session.instructor_hours)}
                </td>
                <td className="max-w-xs px-4 py-3 text-muted-foreground">
                  {session.notes ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
