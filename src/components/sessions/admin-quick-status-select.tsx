"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { adminQuickStatusAction } from "@/app/(app)/courses/[courseId]/sessions/attendance-actions";
import {
  ADMIN_STATUS_OPTIONS,
  type SessionStatus,
} from "@/components/sessions/constants";
import { SESSION_ACTION_SUCCESS } from "@/lib/sessions/action-messages";

type AdminQuickStatusSelectProps = {
  courseId: string;
  sessionId: string;
  currentStatus: SessionStatus;
  compact?: boolean;
};

export function AdminQuickStatusSelect({
  courseId,
  sessionId,
  currentStatus,
  compact = false,
}: AdminQuickStatusSelectProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const actionLock = useRef(false);

  async function handleChange(nextStatus: SessionStatus) {
    if (nextStatus === currentStatus || actionLock.current) {
      return;
    }

    actionLock.current = true;
    setPending(true);
    setError(null);
    setSuccess(null);

    const result = await adminQuickStatusAction(courseId, sessionId, nextStatus);

    setPending(false);
    actionLock.current = false;

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(SESSION_ACTION_SUCCESS.status);
    router.refresh();
  }

  return (
    <div className="min-w-0 space-y-1" aria-busy={pending}>
      <label className="sr-only" htmlFor={`admin-status-${sessionId}`}>
        שינוי סטטוס מהיר
      </label>
      <select
        id={`admin-status-${sessionId}`}
        value={currentStatus}
        disabled={pending}
        onChange={(event) => handleChange(event.target.value as SessionStatus)}
        className={
          compact
            ? "min-h-8 w-full min-w-0 rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-60"
            : "min-h-9 w-full min-w-0 rounded-lg border border-border bg-background px-2 py-1.5 text-sm disabled:opacity-60"
        }
      >
        {ADMIN_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
