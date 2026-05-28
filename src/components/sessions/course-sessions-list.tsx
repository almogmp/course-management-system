"use client";

import { CourseSessionOperations } from "@/components/sessions/course-session-operations";
import { EditSessionForm } from "@/components/sessions/edit-session-form";
import { SessionSimpleStatusSelect } from "@/components/sessions/session-simple-status-select";
import {
  formatSessionDate,
  formatSessionHoursDisplay,
  formatSessionTimeRange,
  isSessionToday,
} from "@/components/sessions/format";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import type { InstructorSelectOption } from "@/lib/instructors/get-instructors-for-select";
import { MobileCard, MobileCardBody, MobileCardField } from "@/components/ui/mobile-card";
import {
  APP_TABLE_CLASS,
  APP_TABLE_NOTES_CLASS,
  APP_TABLE_TD_CLASS,
  APP_TABLE_TH_CLASS,
} from "@/components/ui/table-classes";
import { MOBILE_CARD_LIST_CLASS, MOBILE_CARD_TEXT_BLOCK_CLASS } from "@/components/ui/mobile-card-classes";
import { cn } from "@/lib/utils";

type CourseSessionsListProps = {
  courseId: string;
  sessions: CourseSessionListItem[];
  instructors: InstructorSelectOption[];
  showAdminActions: boolean;
  courseInstitutionRate: number;
  courseInstructorRate: number;
  editingSessionId: string | null;
  onEdit: (sessionId: string) => void;
  onCancelEdit: () => void;
  onEditSuccess: () => void;
};

const tableClass = `${APP_TABLE_CLASS} min-w-[1100px]`;
const thClass = APP_TABLE_TH_CLASS;
const tdClass = APP_TABLE_TD_CLASS;
const tdNotesClass = APP_TABLE_NOTES_CLASS;
const cellCenterWrapClass = "text-center";

export function CourseSessionsList({
  courseId,
  sessions,
  instructors,
  showAdminActions,
  courseInstitutionRate,
  courseInstructorRate,
  editingSessionId,
  onEdit,
  onCancelEdit,
  onEditSuccess,
}: CourseSessionsListProps) {
  return (
    <>
      <ul className={MOBILE_CARD_LIST_CLASS}>
        {sessions.map((session) => {
          const isToday = isSessionToday(session.session_date);
          const isEditing = editingSessionId === session.id;
          const sessionLabel = formatSessionDate(session.session_date);

          return (
            <MobileCard key={session.id} highlight={isToday}>
              {isEditing ? (
                <EditSessionForm
                  courseId={courseId}
                  session={session}
                  instructors={instructors}
                  courseInstitutionRate={courseInstitutionRate}
                  courseInstructorRate={courseInstructorRate}
                  onCancel={onCancelEdit}
                  onSuccess={onEditSuccess}
                />
              ) : (
                <MobileCardBody>
                  <div className={MOBILE_CARD_TEXT_BLOCK_CLASS}>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <MobileCardField value={formatSessionDate(session.session_date)} emphasize />
                      {session.hebrew_date_label ? (
                        <p className="text-xs text-muted-foreground">{session.hebrew_date_label}</p>
                      ) : null}
                      {isToday ? (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          היום
                        </span>
                      ) : null}
                    </div>
                    <MobileCardField
                      value={formatSessionTimeRange(session.start_time, session.end_time)}
                      dir="ltr"
                    />
                    {showAdminActions ? (
                      <MobileCardField
                        label="מדריך: "
                        value={session.instructor_name || "לא שובץ"}
                      />
                    ) : null}
                    <MobileCardField
                      label="שעות מדריך: "
                      value={formatSessionHoursDisplay(session.instructor_hours)}
                    />
                    {showAdminActions ? (
                      <MobileCardField
                        label="שעות חברה: "
                        value={formatSessionHoursDisplay(session.company_hours)}
                      />
                    ) : null}
                    {session.admin_note ? (
                      <MobileCardField label="הערות: " value={session.admin_note} />
                    ) : null}
                    {session.cancellation_reason ? (
                      <MobileCardField label="הערת תפעול: " value={session.cancellation_reason} />
                    ) : null}
                  </div>
                  <SessionSimpleStatusSelect
                    courseId={courseId}
                    sessionId={session.id}
                    currentStatus={session.status}
                    mode={showAdminActions ? "admin" : "instructor"}
                    sessionDate={session.session_date}
                    startTime={session.start_time}
                    className="mx-auto"
                  />
                  <CourseSessionOperations
                    courseId={courseId}
                    session={session}
                    sessionLabel={sessionLabel}
                    showAdminActions={showAdminActions}
                    isEditing={isEditing}
                    onEdit={onEdit}
                    variant="card"
                    includeStatusSelect={false}
                  />
                </MobileCardBody>
              )}
            </MobileCard>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className={tableClass}>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className={thClass}>
                תאריך
              </th>
              <th scope="col" className={thClass}>
                שעות
              </th>
              {showAdminActions ? (
                <th scope="col" className={thClass}>
                  מדריך
                </th>
              ) : null}
              <th scope="col" className={thClass}>
                שעות מדריך
              </th>
              {showAdminActions ? (
                <th scope="col" className={thClass}>
                  שעות חברה
                </th>
              ) : null}
              <th scope="col" className={thClass}>
                סטטוס
              </th>
              <th scope="col" className={thClass}>
                הערות
              </th>
              <th scope="col" className={thClass}>
                פעולות
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const isToday = isSessionToday(session.session_date);
              const isEditing = editingSessionId === session.id;

              if (isEditing) {
                return (
                  <tr key={session.id} className="border-b border-border bg-primary/5">
                    <td
                      colSpan={showAdminActions ? 8 : 6}
                      className="px-4 py-4 text-center align-middle"
                    >
                      <EditSessionForm
                        courseId={courseId}
                        session={session}
                        instructors={instructors}
                        courseInstitutionRate={courseInstitutionRate}
                        courseInstructorRate={courseInstructorRate}
                        onCancel={onCancelEdit}
                        onSuccess={onEditSuccess}
                      />
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={session.id}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    isToday && "bg-primary/5",
                  )}
                >
                  <td className={`${tdClass} text-center font-medium text-foreground`}>
                    <div className={`${cellCenterWrapClass} flex flex-wrap items-center justify-center gap-2`}>
                      <div className="text-center">
                        <span>{formatSessionDate(session.session_date)}</span>
                        {session.hebrew_date_label ? (
                          <p className="text-xs text-muted-foreground">{session.hebrew_date_label}</p>
                        ) : null}
                      </div>
                      {isToday ? (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-center text-xs font-medium text-primary">
                          היום
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className={`${tdClass} text-center`} dir="ltr">
                    <span className="text-center">
                      {formatSessionTimeRange(session.start_time, session.end_time)}
                    </span>
                  </td>
                  {showAdminActions ? (
                    <td className={`${tdClass} text-center text-foreground`}>
                      <span className="text-center">
                        {session.instructor_name || "לא שובץ"}
                      </span>
                    </td>
                  ) : null}
                  <td className={`${tdClass} text-center`}>
                    <span className="text-center">
                      {formatSessionHoursDisplay(session.instructor_hours)}
                    </span>
                  </td>
                  {showAdminActions ? (
                    <td className={`${tdClass} text-center`}>
                      <span className="text-center">
                        {formatSessionHoursDisplay(session.company_hours)}
                      </span>
                    </td>
                  ) : null}
                  <td className={`${tdClass} text-center`}>
                    <div className={`${cellCenterWrapClass} flex justify-center`}>
                      <SessionSimpleStatusSelect
                        courseId={courseId}
                        sessionId={session.id}
                        currentStatus={session.status}
                        mode={showAdminActions ? "admin" : "instructor"}
                        sessionDate={session.session_date}
                        startTime={session.start_time}
                        compact
                      />
                    </div>
                  </td>
                  <td className={`${tdNotesClass} app-table-notes`}>
                    <span className="block text-center">
                      {[session.admin_note, session.cancellation_reason]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </span>
                  </td>
                  <td className={`${APP_TABLE_TD_CLASS} whitespace-nowrap`}>
                    <CourseSessionOperations
                      courseId={courseId}
                      session={session}
                      sessionLabel={formatSessionDate(session.session_date)}
                      showAdminActions={showAdminActions}
                      isEditing={isEditing}
                      onEdit={onEdit}
                      variant="table"
                      includeStatusSelect={false}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
