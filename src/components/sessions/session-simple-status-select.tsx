"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { updateSimpleSessionStatusAction } from "@/app/(app)/courses/[courseId]/sessions/attendance-actions";
import {
  sessionsListSelectValue,
  type SessionStatus,
  type SessionsListAdminStatusValue,
} from "@/components/sessions/constants";
import {
  hasSessionStarted,
  INSTRUCTOR_STATUS_TOO_EARLY_ERROR,
  SIMPLE_SESSION_STATUS_OPTIONS,
} from "@/lib/sessions/simple-session-status";
import { cn } from "@/lib/utils";

type SessionSimpleStatusSelectProps = {
  courseId: string;
  sessionId: string;
  currentStatus: SessionStatus;
  mode: "admin" | "instructor";
  sessionDate?: string;
  startTime?: string;
  compact?: boolean;
  className?: string;
};

export function SessionSimpleStatusSelect({
  courseId,
  sessionId,
  currentStatus,
  mode,
  sessionDate,
  startTime,
  compact = false,
  className,
}: SessionSimpleStatusSelectProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionLock = useRef(false);

  const selectValue = sessionsListSelectValue(currentStatus);
  const instructorCanUpdate =
    mode === "admin" ||
    Boolean(sessionDate && startTime && hasSessionStarted(sessionDate, startTime));

  async function handleChange(nextValue: SessionsListAdminStatusValue) {
    if (nextValue === selectValue || actionLock.current) {
      return;
    }

    if (mode === "instructor" && !instructorCanUpdate) {
      setError(INSTRUCTOR_STATUS_TOO_EARLY_ERROR);
      return;
    }

    actionLock.current = true;
    setPending(true);
    setError(null);

    const result = await updateSimpleSessionStatusAction(courseId, sessionId, nextValue);

    setPending(false);
    actionLock.current = false;

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className={cn("w-full", compact ? "max-w-[9rem]" : "max-w-xs", className)} aria-busy={pending}>
      <select
        id={`session-status-${sessionId}`}
        aria-label="סטטוס מפגש"
        value={selectValue}
        disabled={pending || (mode === "instructor" && !instructorCanUpdate)}
        onChange={(event) => handleChange(event.target.value as SessionsListAdminStatusValue)}
        className={cn(
          "w-full rounded-lg border border-border bg-background text-center font-medium text-foreground disabled:opacity-60",
          compact ? "min-h-8 px-2 py-1 text-xs" : "min-h-9 px-2 py-1.5 text-sm",
        )}
      >
        {SIMPLE_SESSION_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-center text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
