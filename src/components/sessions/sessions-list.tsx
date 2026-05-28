import Link from "next/link";

import {
  formatSessionDate,
  formatSessionHoursDisplay,
  formatSessionTimeRange,
} from "@/components/sessions/format";
import type { SessionListItem } from "@/components/sessions/get-sessions";
import { formatSessionStatusLabel } from "@/lib/admin-reports/filters";
import { SessionGlobalListActions } from "@/components/sessions/session-global-list-actions";
import { SessionListFields } from "@/components/sessions/session-list-fields";
import { MobileCard, MobileCardBody } from "@/components/ui/mobile-card";
import {
  APP_TABLE_CLASS,
  APP_TABLE_TD_CLASS,
  APP_TABLE_TH_CLASS,
} from "@/components/ui/table-classes";
import { MOBILE_CARD_LIST_CLASS } from "@/components/ui/mobile-card-classes";

type SessionsListProps = {
  sessions: SessionListItem[];
  showAdminActions?: boolean;
  showInstitutionColumn?: boolean;
  listReturnPath: string;
};

export function SessionsList({
  sessions,
  showAdminActions = false,
  showInstitutionColumn = false,
  listReturnPath,
}: SessionsListProps) {
  const showInstructorHours = true;
  const showStatus = !showAdminActions;

  return (
    <>
      <ul className={MOBILE_CARD_LIST_CLASS}>
        {sessions.map((session) => (
          <MobileCard key={session.id}>
            <MobileCardBody>
              <SessionListFields
                session={session}
                showInstitution={showInstitutionColumn}
                linkCourse
                showInstructorHours={showInstructorHours}
                showInstructorName={showAdminActions}
                showStatus={showStatus}
              />
              <SessionGlobalListActions
                session={session}
                showAdminActions={showAdminActions}
                listReturnPath={listReturnPath}
                variant="card"
              />
            </MobileCardBody>
          </MobileCard>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className={`${APP_TABLE_CLASS} min-w-[1040px]`}>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className={APP_TABLE_TH_CLASS}>תאריך</th>
              <th className={APP_TABLE_TH_CLASS}>שעות</th>
              <th className={APP_TABLE_TH_CLASS}>קורס</th>
              {showAdminActions ? <th className={APP_TABLE_TH_CLASS}>מדריך</th> : null}
              {showInstitutionColumn ? <th className={APP_TABLE_TH_CLASS}>מוסד</th> : null}
              <th className={APP_TABLE_TH_CLASS}>שעות מדריך</th>
              {!showAdminActions ? <th className={APP_TABLE_TH_CLASS}>סטטוס</th> : null}
              <th className={APP_TABLE_TH_CLASS}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-border last:border-b-0">
                <td className={`${APP_TABLE_TD_CLASS} font-medium text-foreground`}>
                  {formatSessionDate(session.session_date)}
                </td>
                <td className={APP_TABLE_TD_CLASS} dir="ltr">
                  {formatSessionTimeRange(session.start_time, session.end_time)}
                </td>
                <td className={`${APP_TABLE_TD_CLASS} text-foreground`}>
                  <Link
                    href={`/courses/${session.course_id}/sessions`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {session.course_name}
                  </Link>
                </td>
                {showAdminActions ? (
                  <td className={APP_TABLE_TD_CLASS}>{session.instructor_name}</td>
                ) : null}
                {showInstitutionColumn ? (
                  <td className={APP_TABLE_TD_CLASS}>{session.institution_name}</td>
                ) : null}
                <td className={APP_TABLE_TD_CLASS}>
                  {formatSessionHoursDisplay(session.instructor_hours)}
                </td>
                {!showAdminActions ? (
                  <td className={APP_TABLE_TD_CLASS}>{formatSessionStatusLabel(session.status)}</td>
                ) : null}
                <td className={APP_TABLE_TD_CLASS}>
                  <SessionGlobalListActions
                    session={session}
                    showAdminActions={showAdminActions}
                    listReturnPath={listReturnPath}
                    variant="table"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
