"use client";

import type { SessionStatus } from "@/components/sessions/constants";
import { SessionSimpleStatusSelect } from "@/components/sessions/session-simple-status-select";

type AdminQuickStatusSelectProps = {
  courseId: string;
  sessionId: string;
  currentStatus: SessionStatus;
  compact?: boolean;
  sessionDate?: string;
  startTime?: string;
};

export function AdminQuickStatusSelect({
  courseId,
  sessionId,
  currentStatus,
  compact = false,
  sessionDate,
  startTime,
}: AdminQuickStatusSelectProps) {
  return (
    <SessionSimpleStatusSelect
      courseId={courseId}
      sessionId={sessionId}
      currentStatus={currentStatus}
      mode="admin"
      sessionDate={sessionDate}
      startTime={startTime}
      compact={compact}
    />
  );
}
