"use client";

import { DeleteSessionButton } from "@/components/sessions/delete-session-button";
import { EditSessionForm } from "@/components/sessions/edit-session-form";
import { SessionWorkflowActions } from "@/components/sessions/session-workflow-actions";
import { SessionSimpleActions } from "@/components/sessions/session-simple-actions";
import { AdminQuickStatusSelect } from "@/components/sessions/admin-quick-status-select";
import { isSessionDelayed } from "@/lib/sessions/session-delay";
import { SessionStatusBadge } from "@/components/sessions/session-status-badge";
import {
  formatSessionDate,
  formatSessionHours,
  formatSessionTimeRange,
  isSessionToday,
} from "@/components/sessions/format";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import type { InstructorSelectOption } from "@/lib/instructors/get-instructors-for-select";
import { cn } from "@/lib/utils";

type CourseSessionsListProps = {
  courseId: string;
  sessions: CourseSessionListItem[];
  instructors: InstructorSelectOption[];
  showAdminActions: boolean;
  currentInstructorId: string | null;
  editingSessionId: string | null;
  onEdit: (sessionId: string) => void;
  onCancelEdit: () => void;
  onEditSuccess: () => void;
};

function SessionActions({
  courseId,
  sessionId,
  showAdminActions,
  isEditing,
  onEdit,
}: {
  courseId: string;
  sessionId: string;
  showAdminActions: boolean;
  isEditing: boolean;
  onEdit: (sessionId: string) => void;
}) {
  if (!showAdminActions || isEditing) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onEdit(sessionId)}
        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        עריכה
      </button>
      <DeleteSessionButton courseId={courseId} sessionId={sessionId} />
    </div>
  );
}

export function CourseSessionsList({
  courseId,
  sessions,
  instructors,
  showAdminActions,
  currentInstructorId,
  editingSessionId,
  onEdit,
  onCancelEdit,
  onEditSuccess,
}: CourseSessionsListProps) {
  return (
    <>
      <ul className="space-y-3 md:hidden">
        {sessions.map((session) => {
          const isToday = isSessionToday(session.session_date);
          const isEditing = editingSessionId === session.id;

          return (
            <li
              key={session.id}
              className={cn(
                "rounded-xl border bg-surface p-4 text-start",
                isToday ? "border-primary ring-2 ring-primary/20" : "border-border",
              )}
            >
              {isEditing ? (
                <EditSessionForm
                  courseId={courseId}
                  session={session}
                  instructors={instructors}
                  onCancel={onCancelEdit}
                  onSuccess={onEditSuccess}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {formatSessionDate(session.session_date)}
                      </p>
                      {isToday ? (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          היום
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      {formatSessionTimeRange(session.start_time, session.end_time)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">שעות מדריך: </span>
                      {formatSessionHours(session.instructor_hours)}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">שעות חברה: </span>
                      {formatSessionHours(session.company_hours)}
                    </p>
                  </div>
                  {session.admin_note ? (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">הערות: </span>
                      {session.admin_note}
                    </p>
                  ) : null}
                  {session.cancellation_reason ? (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">הערת תפעול: </span>
                      {session.cancellation_reason}
                    </p>
                  ) : null}
                  <SessionStatusBadge
                    status={session.status}
                    isDelayed={isSessionDelayed(
                      session.session_date,
                      session.start_time,
                      session.status,
                      session.actual_arrival_time,
                    )}
                  />
                  {showAdminActions ? (
                    <AdminQuickStatusSelect
                      courseId={courseId}
                      sessionId={session.id}
                      currentStatus={session.status}
                    />
                  ) : null}
                  <SessionActions
                    courseId={courseId}
                    sessionId={session.id}
                    showAdminActions={showAdminActions}
                    isEditing={isEditing}
                    onEdit={onEdit}
                  />
                  <SessionWorkflowActions
                    courseId={courseId}
                    session={session}
                    showAdminActions={showAdminActions}
                    currentInstructorId={currentInstructorId}
                  />
                  <SessionSimpleActions
                    courseId={courseId}
                    session={session}
                    currentInstructorId={currentInstructorId}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="w-full min-w-[960px] text-start text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                תאריך
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                שעות
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                שעות מדריך
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                שעות חברה
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                סטטוס
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                הערות
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
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
                    <td colSpan={7} className="px-4 py-4">
                      <EditSessionForm
                        courseId={courseId}
                        session={session}
                        instructors={instructors}
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
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{formatSessionDate(session.session_date)}</span>
                      {isToday ? (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          היום
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" dir="ltr">
                    {formatSessionTimeRange(session.start_time, session.end_time)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatSessionHours(session.instructor_hours)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatSessionHours(session.company_hours)}
                  </td>
                  <td className="px-4 py-3">
                    <SessionStatusBadge
                      status={session.status}
                      isDelayed={isSessionDelayed(
                        session.session_date,
                        session.start_time,
                        session.status,
                        session.actual_arrival_time,
                      )}
                    />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    {[session.admin_note, session.cancellation_reason]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-48 flex-col gap-2">
                      {showAdminActions ? (
                        <AdminQuickStatusSelect
                          courseId={courseId}
                          sessionId={session.id}
                          currentStatus={session.status}
                          compact
                        />
                      ) : null}
                      <SessionActions
                        courseId={courseId}
                        sessionId={session.id}
                        showAdminActions={showAdminActions}
                        isEditing={isEditing}
                        onEdit={onEdit}
                      />
                      <SessionWorkflowActions
                        courseId={courseId}
                        session={session}
                        showAdminActions={showAdminActions}
                        currentInstructorId={currentInstructorId}
                      />
                      <SessionSimpleActions
                        courseId={courseId}
                        session={session}
                        currentInstructorId={currentInstructorId}
                      />
                    </div>
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
