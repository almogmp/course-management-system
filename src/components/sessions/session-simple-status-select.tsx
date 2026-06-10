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
import {
  isSessionStatusActionFailure,
  STATUS_UPDATE_GENERIC_ERROR,
} from "@/lib/sessions/session-status-action-result";
import { cn } from "@/lib/utils";

type SessionSimpleStatusSelectProps = {
  courseId: string;
  sessionId: string;
  currentStatus: SessionStatus;
  mode: "admin" | "instructor";
  sessionDate?: string;
  startTime?: string;
  compact?: boolean;
  /** Extra-dense styling for dashboard calendar cards */
  calendar?: boolean;
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
  calendar = false,
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

    try {
      const result = await updateSimpleSessionStatusAction(courseId, sessionId, nextValue);

      if (isSessionStatusActionFailure(result)) {
        setError(result?.error ?? STATUS_UPDATE_GENERIC_ERROR);
        return;
      }

      router.refresh();
    } catch {
      setError(STATUS_UPDATE_GENERIC_ERROR);
    } finally {
      setPending(false);
      actionLock.current = false;
    }
  }

  return (
    <div
      className={cn(
        "w-full",
        calendar ? "max-w-full" : compact ? "max-w-[9rem]" : "max-w-xs",
        className,
      )}
      aria-busy={pending}
    >
      <select
        id={`session-status-${sessionId}`}
        aria-label="סטטוס מפגש"
        value={selectValue}
        disabled={pending || (mode === "instructor" && !instructorCanUpdate)}
        onChange={(event) => handleChange(event.target.value as SessionsListAdminStatusValue)}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          "w-full rounded border border-border bg-background text-center font-medium text-foreground disabled:opacity-60",
          calendar
            ? "min-h-7 px-1 py-0.5 text-[10px] sm:text-xs"
            : compact
              ? "min-h-8 px-2 py-1 text-xs"
              : "min-h-9 rounded-lg px-2 py-1.5 text-sm",
        )}
      >
        {SIMPLE_SESSION_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p
          className={cn(
            "mt-0.5 text-center text-red-700",
            calendar ? "text-[9px] leading-tight" : "text-xs",
          )}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
