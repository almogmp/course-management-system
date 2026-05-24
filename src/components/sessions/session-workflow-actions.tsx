"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";

import {
  adminApproveCancellationAction,
  adminReturnSessionToPlannedAction,
  markSessionCompletedAction,
  requestSessionCancellationAction,
  type SessionWorkflowFormState,
} from "@/app/(app)/courses/[courseId]/sessions/workflow-actions";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import { Button } from "@/components/ui/button";
import {
  canAdminApproveCancellation,
  canAdminReturnToPlanned,
  canInstructorMarkCompleted,
  canInstructorRequestCancellation,
  instructorOwnsSession,
} from "@/lib/sessions/session-workflow";

type SessionWorkflowActionsProps = {
  courseId: string;
  session: CourseSessionListItem;
  showAdminActions: boolean;
  currentInstructorId: string | null;
};

const initialState: SessionWorkflowFormState = {};

function WorkflowMessage({ state }: { state: SessionWorkflowFormState }) {
  if (state.success) {
    return (
      <p className="text-xs text-green-700" role="status">
        העדכון נשמר בהצלחה.
      </p>
    );
  }

  if (state.error) {
    return (
      <p className="text-xs text-red-700" role="alert">
        {state.error}
      </p>
    );
  }

  return null;
}

function MarkCompletedForm({
  courseId,
  sessionId,
}: {
  courseId: string;
  sessionId: string;
}) {
  const router = useRouter();
  const action = markSessionCompletedAction.bind(null, courseId, sessionId);
  const [state, formAction] = useFormState(action, initialState);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (state.success) {
      setExpanded(false);
      router.refresh();
    }
  }, [state.success, router]);

  if (!expanded) {
    return (
      <div className="space-y-1">
        <Button
          type="button"
          className="min-h-9 w-full sm:w-auto"
          onClick={() => setExpanded(true)}
        >
          סמן כבוצע
        </Button>
        <WorkflowMessage state={state} />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2 rounded-lg border border-border bg-background p-3">
      <label className="block text-xs font-medium text-foreground" htmlFor={`completion-notes-${sessionId}`}>
        הערות השלמה (אופציונלי)
      </label>
      <textarea
        id={`completion-notes-${sessionId}`}
        name="completion_notes"
        rows={2}
        className="min-h-16 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="min-h-9">
          שמירה
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-9"
          onClick={() => setExpanded(false)}
        >
          ביטול
        </Button>
      </div>
      <WorkflowMessage state={state} />
    </form>
  );
}

function RequestCancellationForm({
  courseId,
  sessionId,
}: {
  courseId: string;
  sessionId: string;
}) {
  const router = useRouter();
  const action = requestSessionCancellationAction.bind(null, courseId, sessionId);
  const [state, formAction] = useFormState(action, initialState);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (state.success) {
      setExpanded(false);
      router.refresh();
    }
  }, [state.success, router]);

  if (!expanded) {
    return (
      <div className="space-y-1">
        <Button
          type="button"
          variant="secondary"
          className="min-h-9 w-full border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100 sm:w-auto"
          onClick={() => setExpanded(true)}
        >
          בקש ביטול
        </Button>
        <WorkflowMessage state={state} />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
      <label
        className="block text-xs font-medium text-foreground"
        htmlFor={`cancellation-reason-${sessionId}`}
      >
        סיבת בקשת הביטול
      </label>
      <textarea
        id={`cancellation-reason-${sessionId}`}
        name="cancellation_reason"
        rows={2}
        required
        className="min-h-16 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="secondary" className="min-h-9">
          שליחת בקשה
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-9"
          onClick={() => setExpanded(false)}
        >
          ביטול
        </Button>
      </div>
      <WorkflowMessage state={state} />
    </form>
  );
}

function AdminWorkflowButtons({
  courseId,
  sessionId,
  status,
}: {
  courseId: string;
  sessionId: string;
  status: CourseSessionListItem["status"];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<SessionWorkflowFormState>({});

  async function runAction(
    key: string,
    action: () => Promise<SessionWorkflowFormState>,
  ) {
    setPending(key);
    setMessage({});

    const result = await action();

    setPending(null);
    setMessage(result);

    if (result.success) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {canAdminApproveCancellation(status) ? (
          <Button
            type="button"
            className="min-h-9"
            disabled={pending !== null}
            onClick={() =>
              runAction("approve", () => adminApproveCancellationAction(courseId, sessionId))
            }
          >
            {pending === "approve" ? "מאשר..." : "אישור ביטול"}
          </Button>
        ) : null}
        {canAdminReturnToPlanned(status) ? (
          <Button
            type="button"
            variant="secondary"
            className="min-h-9"
            disabled={pending !== null}
            onClick={() =>
              runAction("planned", () => adminReturnSessionToPlannedAction(courseId, sessionId))
            }
          >
            {pending === "planned" ? "מעדכן..." : "החזרה למתוכנן"}
          </Button>
        ) : null}
      </div>
      <WorkflowMessage state={message} />
    </div>
  );
}

export function SessionWorkflowActions({
  courseId,
  session,
  showAdminActions,
  currentInstructorId,
}: SessionWorkflowActionsProps) {
  const ownsSession = instructorOwnsSession(
    session.assigned_instructor_id,
    currentInstructorId,
  );

  if (showAdminActions) {
    if (session.status !== "deferred") {
      return null;
    }

    return (
      <AdminWorkflowButtons
        courseId={courseId}
        sessionId={session.id}
        status={session.status}
      />
    );
  }

  if (!ownsSession) {
    return null;
  }

  const showComplete = canInstructorMarkCompleted(
    session.status,
    session.session_date,
    session.end_time,
    ownsSession,
  );
  const showCancelRequest = canInstructorRequestCancellation(session.status, ownsSession);

  if (!showComplete && !showCancelRequest) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      {showComplete ? (
        <MarkCompletedForm courseId={courseId} sessionId={session.id} />
      ) : null}
      {showCancelRequest ? (
        <RequestCancellationForm courseId={courseId} sessionId={session.id} />
      ) : null}
    </div>
  );
}
