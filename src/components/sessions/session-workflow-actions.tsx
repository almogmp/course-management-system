"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  adminApproveCancellationAction,
  adminReturnSessionToPlannedAction,
  type SessionWorkflowFormState,
} from "@/app/(app)/courses/[courseId]/sessions/workflow-actions";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import { Button } from "@/components/ui/button";
import {
  canAdminApproveCancellation,
  canAdminReturnToPlanned,
} from "@/lib/sessions/session-workflow";

type SessionWorkflowActionsProps = {
  courseId: string;
  session: CourseSessionListItem;
  showAdminActions: boolean;
  currentInstructorId: string | null;
};

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
}: SessionWorkflowActionsProps) {
  if (!showAdminActions || session.status !== "deferred") {
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
