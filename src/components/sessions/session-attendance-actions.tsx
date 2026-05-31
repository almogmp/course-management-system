"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  confirmArrivalAction,
  confirmSessionEndedAction,
  confirmSessionStartedAction,
} from "@/app/(app)/courses/[courseId]/sessions/attendance-actions";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import { Button } from "@/components/ui/button";
import { SESSION_ACTION_SUCCESS } from "@/lib/sessions/action-messages";
import {
  isSessionStatusActionFailure,
  STATUS_UPDATE_GENERIC_ERROR,
  type SessionStatusActionResult,
} from "@/lib/sessions/session-status-action-result";
import { isSessionDelayed } from "@/lib/sessions/session-delay";
import { instructorOwnsSession } from "@/lib/sessions/session-workflow";

type SessionAttendanceActionsProps = {
  courseId: string;
  session: CourseSessionListItem;
  currentInstructorId: string | null;
};

export function SessionAttendanceActions({
  courseId,
  session,
  currentInstructorId,
}: SessionAttendanceActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const actionLock = useRef(false);

  const ownsSession = instructorOwnsSession(
    session.assigned_instructor_id,
    currentInstructorId,
  );

  if (!ownsSession) {
    return null;
  }

  const isDelayed = isSessionDelayed(
    session.session_date,
    session.start_time,
    session.status,
    session.actual_arrival_time,
  );

  async function runAction(
    key: string,
    successMessage: string,
    action: () => Promise<SessionStatusActionResult>,
  ) {
    if (actionLock.current) {
      return;
    }

    actionLock.current = true;
    setPending(key);
    setError(null);
    setSuccess(null);

    try {
      const result = await action();

      if (isSessionStatusActionFailure(result)) {
        setError(result?.error ?? STATUS_UPDATE_GENERIC_ERROR);
        return;
      }

      setSuccess(successMessage);
      router.refresh();
    } catch {
      setError(STATUS_UPDATE_GENERIC_ERROR);
    } finally {
      setPending(null);
      actionLock.current = false;
    }
  }

  const showArrival = session.status === "planned";
  const showStart = session.status === "arrived";
  const showEnd = session.status === "in_progress";

  if (!showArrival && !showStart && !showEnd) {
    return null;
  }

  const isBusy = pending !== null;

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3" aria-busy={isBusy}>
      {isDelayed ? (
        <p className="text-xs font-semibold text-orange-700">המפגש באיחור — יש לאשר הגעה</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {showArrival ? (
          <Button
            type="button"
            className="min-h-9"
            disabled={isBusy}
            aria-disabled={isBusy}
            onClick={() =>
              runAction("arrival", SESSION_ACTION_SUCCESS.arrival, () =>
                confirmArrivalAction(courseId, session.id),
              )
            }
          >
            {pending === "arrival" ? "שומר..." : "הגעתי"}
          </Button>
        ) : null}
        {showStart ? (
          <Button
            type="button"
            className="min-h-9"
            disabled={isBusy}
            aria-disabled={isBusy}
            onClick={() =>
              runAction("start", SESSION_ACTION_SUCCESS.start, () =>
                confirmSessionStartedAction(courseId, session.id),
              )
            }
          >
            {pending === "start" ? "שומר..." : "התחלתי מפגש"}
          </Button>
        ) : null}
        {showEnd ? (
          <Button
            type="button"
            className="min-h-9 bg-green-700 hover:bg-green-800"
            disabled={isBusy}
            aria-disabled={isBusy}
            onClick={() =>
              runAction("end", SESSION_ACTION_SUCCESS.end, () =>
                confirmSessionEndedAction(courseId, session.id),
              )
            }
          >
            {pending === "end" ? "שומר..." : "סיימתי מפגש"}
          </Button>
        ) : null}
      </div>
      {success ? (
        <p className="text-xs text-green-700" role="status">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
