"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFormState } from "react-dom";

import {
  instructorMarkCancelledAction,
  markSessionCompletedAction,
  type SessionWorkflowFormState,
} from "@/app/(app)/courses/[courseId]/sessions/workflow-actions";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import { Button } from "@/components/ui/button";
import {
  canInstructorMarkCancelled,
  canInstructorMarkCompleted,
  hasSessionEnded,
  instructorOwnsSession,
} from "@/lib/sessions/session-workflow";

type SessionSimpleActionsProps = {
  courseId: string;
  session: CourseSessionListItem;
  currentInstructorId: string | null;
};

const initialState: SessionWorkflowFormState = {};

export function SessionSimpleActions({
  courseId,
  session,
  currentInstructorId,
}: SessionSimpleActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const actionLock = useRef(false);

  const cancelAction = instructorMarkCancelledAction.bind(null, courseId, session.id);
  const [cancelState, cancelFormAction] = useFormState(cancelAction, initialState);

  const ownsSession = instructorOwnsSession(
    session.assigned_instructor_id,
    currentInstructorId,
  );

  if (!ownsSession) {
    return null;
  }

  const canComplete = canInstructorMarkCompleted(
    session.status,
    session.session_date,
    session.end_time,
    ownsSession,
  );
  const canCancel = canInstructorMarkCancelled(session.status, ownsSession);
  const ended = hasSessionEnded(session.session_date, session.end_time);
  const showComplete = canComplete && ended;

  if (!showComplete && !canCancel) {
    return null;
  }

  async function markCompleted() {
    if (actionLock.current || !showComplete) {
      return;
    }

    actionLock.current = true;
    setPending("complete");
    setError(null);

    const result = await markSessionCompletedAction(
      courseId,
      session.id,
      initialState,
      new FormData(),
    );

    setPending(null);
    actionLock.current = false;

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  const isBusy = pending !== null;

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3" aria-busy={isBusy}>
      <div className="flex flex-wrap gap-2">
        {showComplete ? (
          <Button
            type="button"
            className="min-h-9 bg-green-700 hover:bg-green-800"
            disabled={isBusy}
            onClick={markCompleted}
          >
            {pending === "complete" ? "שומר..." : "בוצע"}
          </Button>
        ) : null}
        {canCancel && !showCancelForm ? (
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 border-red-300 bg-red-50 text-red-950 hover:bg-red-100"
            disabled={isBusy}
            onClick={() => setShowCancelForm(true)}
          >
            בוטל
          </Button>
        ) : null}
      </div>
      {showCancelForm && canCancel ? (
        <form action={cancelFormAction} className="space-y-2 rounded-lg border border-red-200 bg-red-50/50 p-3">
          <label className="block text-xs font-medium text-foreground" htmlFor={`cancel-${session.id}`}>
            סיבת ביטול
          </label>
          <textarea
            id={`cancel-${session.id}`}
            name="cancellation_reason"
            rows={2}
            required
            className="min-h-16 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="secondary" className="min-h-9" disabled={isBusy}>
              אישור ביטול
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="min-h-9"
              onClick={() => setShowCancelForm(false)}
            >
              ביטול
            </Button>
          </div>
          {cancelState.error ? (
            <p className="text-xs text-red-700" role="alert">
              {cancelState.error}
            </p>
          ) : null}
          {cancelState.success ? (
            <p className="text-xs text-green-700" role="status">
              המפגש סומן כבוטל.
            </p>
          ) : null}
        </form>
      ) : null}
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
