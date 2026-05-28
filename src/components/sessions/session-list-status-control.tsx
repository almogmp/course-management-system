"use client";

import type { SessionStatus } from "@/components/sessions/constants";
import { SessionSimpleStatusSelect } from "@/components/sessions/session-simple-status-select";

type SessionListStatusControlProps = {
  courseId: string;
  sessionId: string;
  status: SessionStatus;
  showAdminActions: boolean;
  sessionDate: string;
  startTime: string;
};

/** סטטוס מפגש — אותו select למנהל ולמדריך (מתוכנן / בוצע / בוטל). */
export function SessionListStatusControl({
  courseId,
  sessionId,
  status,
  showAdminActions,
  sessionDate,
  startTime,
}: SessionListStatusControlProps) {
  return (
    <SessionSimpleStatusSelect
      courseId={courseId}
      sessionId={sessionId}
      currentStatus={status}
      mode={showAdminActions ? "admin" : "instructor"}
      sessionDate={sessionDate}
      startTime={startTime}
    />
  );
}
