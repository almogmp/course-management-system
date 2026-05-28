"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { adminQuickStatusAction } from "@/app/(app)/courses/[courseId]/sessions/attendance-actions";
import {
  SESSIONS_LIST_ADMIN_STATUS_OPTIONS,
  type SessionsListAdminStatusValue,
} from "@/components/sessions/constants";
import type { SessionStatus } from "@/components/sessions/constants";
import { SESSION_STATUS_LABELS } from "@/components/sessions/constants";
import { SESSION_ACTION_SUCCESS } from "@/lib/sessions/action-messages";

type SessionsListAdminStatusSelectProps = {
  courseId: string;
  sessionId: string;
  currentStatus: SessionStatus;
};

export function SessionsListAdminStatusSelect({
  courseId,
  sessionId,
  currentStatus,
}: SessionsListAdminStatusSelectProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionLock = useRef(false);

  async function handleChange(nextValue: SessionsListAdminStatusValue) {
    const nextStatus = nextValue;

    if (nextStatus === currentStatus || actionLock.current) {
      return;
    }

    actionLock.current = true;
    setPending(true);
    setError(null);

    const result = await adminQuickStatusAction(courseId, sessionId, nextStatus);

    setPending(false);
    actionLock.current = false;

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[9rem] space-y-1" aria-busy={pending}>
      <label className="sr-only" htmlFor={`sessions-list-status-${sessionId}`}>
        שינוי סטטוס
      </label>
      <p className="text-center text-[11px] text-muted-foreground">
        סטטוס נוכחי: {SESSION_STATUS_LABELS[currentStatus] ?? currentStatus}
      </p>
      <select
        id={`sessions-list-status-${sessionId}`}
        value=""
        disabled={pending}
        onChange={(event) => handleChange(event.target.value as SessionsListAdminStatusValue)}
        className="min-h-9 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm disabled:opacity-60"
      >
        <option value="" disabled>
          שינוי סטטוס…
        </option>
        {SESSIONS_LIST_ADMIN_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-center text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : pending ? (
        <p className="text-center text-xs text-muted-foreground" role="status">
          {SESSION_ACTION_SUCCESS.status}
        </p>
      ) : null}
    </div>
  );
}
