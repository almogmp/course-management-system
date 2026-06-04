"use server";

import { revalidatePath } from "next/cache";

import type { SessionStatus } from "@/components/sessions/constants";
import { isAdminEmail } from "@/config/admin";
import { requireAuthForAction } from "@/lib/auth/require-for-action";
import { getCurrentInstructorId } from "@/lib/auth/instructor";
import { SESSION_ACTION_SUCCESS, mapSessionActionError } from "@/lib/sessions/action-messages";
import {
  hasSessionStarted,
  INSTRUCTOR_STATUS_TOO_EARLY_ERROR,
  parseSimpleSessionStatusInput,
  toDbSimpleSessionStatus,
  type SessionsListAdminStatusValue,
} from "@/lib/sessions/simple-session-status";
import {
  STATUS_UPDATE_GENERIC_ERROR,
  sessionStatusFailure,
  sessionStatusSuccess,
  type SessionStatusActionResult,
} from "@/lib/sessions/session-status-action-result";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

/** @deprecated Prefer SessionStatusActionResult */
export type AttendanceActionState = SessionStatusActionResult;

function revalidateSessionPaths(courseId: string) {
  revalidatePath(`/courses/${courseId}/sessions`);
  revalidatePath("/sessions");
  revalidatePath("/dashboard");
}

async function assertInstructorOwnsSession(
  courseId: string,
  sessionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const instructorClient = supabase as unknown as typeof supabase & {
    from: (relation: string) => ReturnType<typeof supabase.from>;
  };

  const { data, error } = await instructorClient
    .from("instructor_sessions")
    .select("id, course_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: mapSessionActionError(error.message) };
  }

  const row = data as { id: string; course_id: string } | null;

  if (!row || row.course_id !== courseId) {
    return { ok: false, error: "אין הרשאה לעדכן מפגש זה." };
  }

  return { ok: true };
}

function mapUpdateError(error: { message: string }): SessionStatusActionResult {
  return sessionStatusFailure(mapSessionActionError(error.message));
}

function buildSimpleStatusPayload(
  status: SessionStatus,
  existing: {
    cancellation_reason: string | null;
    actual_arrival_time: string | null;
    actual_start_time: string | null;
    actual_end_time: string | null;
  },
  options: { asAdmin: boolean },
): Database["public"]["Tables"]["sessions"]["Update"] {
  const now = new Date().toISOString();
  const payload: Database["public"]["Tables"]["sessions"]["Update"] = { status };

  if (status === "planned") {
    payload.cancellation_reason = null;
    payload.actual_arrival_time = null;
    payload.actual_start_time = null;
    payload.actual_end_time = null;
  }

  if (status === "completed" && !existing.actual_end_time) {
    payload.actual_end_time = now;
  }

  if (status === "cancelled" && !existing.cancellation_reason?.trim()) {
    payload.cancellation_reason = options.asAdmin
      ? "בוטל על ידי מנהל"
      : "בוטל על ידי מדריך";
  }

  return payload;
}

const NO_ROWS_UPDATED_ERROR =
  "לא נמצאה הרשאה לעדכן את המפגש או שהמפגש לא נמצא.";

type InstructorStatusRpcRow = {
  id: string;
  status: SessionStatus;
};

async function persistInstructorSessionStatusViaRpc(input: {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  courseId: string;
  sessionId: string;
  userId: string;
  instructorId: string;
  previousStatus: string;
  targetStatus: SessionStatus;
}): Promise<SessionStatusActionResult> {
  console.error("[sessionStatusUpdate] before", {
    sessionId: input.sessionId,
    courseId: input.courseId,
    userId: input.userId,
    instructorId: input.instructorId,
    role: "instructor",
    currentStatus: input.previousStatus,
    targetStatus: input.targetStatus,
    method: "rpc",
  });

  const { data, error: rpcError } = await input.supabase.rpc("update_instructor_session_status", {
    p_session_id: input.sessionId,
    p_course_id: input.courseId,
    p_status: input.targetStatus,
  });

  const rows = (data ?? []) as InstructorStatusRpcRow[];
  const updateData = rows[0] ?? null;

  console.error("[sessionStatusUpdate] update", {
    sessionId: input.sessionId,
    targetStatus: input.targetStatus,
    method: "rpc",
    updateError: rpcError?.message ?? null,
    updateErrorCode: rpcError?.code ?? null,
    updateData,
    updateStatus: updateData?.status ?? null,
    rowsReturned: rows.length,
    rlsLikelyBlocked: false,
    triggerLikelyBlocked: false,
  });

  if (rpcError) {
    return mapUpdateError(rpcError);
  }

  if (!updateData || updateData.status !== input.targetStatus) {
    return sessionStatusFailure(NO_ROWS_UPDATED_ERROR);
  }

  const instructorClient = input.supabase as unknown as typeof input.supabase & {
    from: (relation: string) => ReturnType<typeof input.supabase.from>;
  };

  const { data: verifiedRow, error: verifyError } = await instructorClient
    .from("instructor_sessions")
    .select("status")
    .eq("id", input.sessionId)
    .eq("course_id", input.courseId)
    .maybeSingle();

  const verifiedStatus =
    (verifiedRow as { status: SessionStatus } | null)?.status ?? null;

  console.error("[sessionStatusUpdate] after", {
    sessionId: input.sessionId,
    verifySource: "instructor_sessions",
    verifyError: verifyError?.message ?? null,
    verifiedStatus,
    targetStatus: input.targetStatus,
    persistedViaRpc: updateData.status,
  });

  if (verifyError) {
    return mapUpdateError(verifyError);
  }

  if (verifiedStatus !== input.targetStatus) {
    return sessionStatusFailure(
      "הסטטוס לא נשמר כמצופה. נסה שוב או פנה למנהל המערכת.",
    );
  }

  revalidateSessionPaths(input.courseId);
  return sessionStatusSuccess(SESSION_ACTION_SUCCESS.status);
}

async function persistSessionStatusUpdate(input: {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  courseId: string;
  sessionId: string;
  userId: string;
  instructorId?: string | null;
  previousStatus: string;
  targetStatus: SessionStatus;
  payload: Database["public"]["Tables"]["sessions"]["Update"];
  role: "admin" | "instructor";
}): Promise<SessionStatusActionResult> {
  console.error("[sessionStatusUpdate] before", {
    sessionId: input.sessionId,
    courseId: input.courseId,
    userId: input.userId,
    instructorId: input.instructorId ?? null,
    role: input.role,
    currentStatus: input.previousStatus,
    targetStatus: input.targetStatus,
    payloadKeys: Object.keys(input.payload),
  });

  const { data: updateData, error: updateError } = await input.supabase
    .from("sessions")
    .update(input.payload)
    .eq("id", input.sessionId)
    .eq("course_id", input.courseId)
    .select("id, status")
    .maybeSingle();

  const rowsReturned = updateData ? 1 : 0;

  console.error("[sessionStatusUpdate] update", {
    sessionId: input.sessionId,
    targetStatus: input.targetStatus,
    usedSelect: true,
    matchedFilters: { id: input.sessionId, course_id: input.courseId },
    updateError: updateError?.message ?? null,
    updateErrorCode: updateError?.code ?? null,
    updateData: updateData ?? null,
    updateStatus: updateData?.status ?? null,
    rowsReturned,
    rlsLikelyBlocked: !updateError && rowsReturned === 0,
    triggerLikelyBlocked:
      Boolean(updateError?.message?.includes("Cannot mark completed before session end")) ||
      Boolean(updateError?.message?.includes("Instructor cannot")),
  });

  if (updateError) {
    return mapUpdateError(updateError);
  }

  if (!updateData) {
    return sessionStatusFailure(NO_ROWS_UPDATED_ERROR);
  }

  if (updateData.status !== input.targetStatus) {
    return sessionStatusFailure(
      "הסטטוס לא נשמר כמצופה. נסה שוב או פנה למנהל המערכת.",
    );
  }

  const verifyClient = input.supabase as unknown as typeof input.supabase & {
    from: (relation: string) => ReturnType<typeof input.supabase.from>;
  };

  let verifiedStatus: string | null = null;
  let verifyError: { message: string } | null = null;
  const verifySource =
    input.role === "instructor" ? "instructor_sessions" : "sessions";

  if (input.role === "instructor") {
    const { data: verifiedRow, error } = await verifyClient
      .from("instructor_sessions")
      .select("status")
      .eq("id", input.sessionId)
      .eq("course_id", input.courseId)
      .maybeSingle();

    verifyError = error;
    verifiedStatus = (verifiedRow as { status?: string } | null)?.status ?? null;
  } else {
    const { data: verifiedRow, error } = await input.supabase
      .from("sessions")
      .select("status")
      .eq("id", input.sessionId)
      .eq("course_id", input.courseId)
      .maybeSingle();

    verifyError = error;
    verifiedStatus = verifiedRow?.status ?? null;
  }

  console.error("[sessionStatusUpdate] after", {
    sessionId: input.sessionId,
    verifySource,
    verifyError: verifyError?.message ?? null,
    verifiedStatus,
    targetStatus: input.targetStatus,
    persistedViaUpdateReturn: updateData.status,
  });

  if (verifyError) {
    return mapUpdateError(verifyError);
  }

  if (verifiedStatus !== input.targetStatus) {
    return sessionStatusFailure(
      "הסטטוס לא נשמר כמצופה. נסה שוב או פנה למנהל המערכת.",
    );
  }

  revalidateSessionPaths(input.courseId);
  return sessionStatusSuccess(SESSION_ACTION_SUCCESS.status);
}

/** מתוכנן / בוצע / בוטל — מנהל בכל זמן; מדריך רק אחרי שעת התחלה ובמפגש משויך. */
export async function updateSimpleSessionStatusAction(
  courseId: string,
  sessionId: string,
  statusInput: SessionsListAdminStatusValue,
): Promise<SessionStatusActionResult> {
  try {
    const auth = await requireAuthForAction();

    if (!auth.ok) {
      return sessionStatusFailure(auth.error);
    }

    const status = toDbSimpleSessionStatus(statusInput);
    const parsed = parseSimpleSessionStatusInput(status);

    if (!parsed) {
      return sessionStatusFailure("סטטוס מפגש אינו תקין.");
    }

    const asAdmin = Boolean(auth.isAdmin && auth.email && isAdminEmail(auth.email));
    const supabase = await createServerSupabaseClient();

    if (asAdmin) {
      const { data: existing, error: fetchError } = await supabase
        .from("sessions")
        .select(
          "status, cancellation_reason, actual_arrival_time, actual_start_time, actual_end_time",
        )
        .eq("id", sessionId)
        .eq("course_id", courseId)
        .maybeSingle();

      if (fetchError) {
        return mapUpdateError(fetchError);
      }

      if (!existing) {
        return sessionStatusFailure("המפגש לא נמצא.");
      }

      const payload = buildSimpleStatusPayload(status, existing, { asAdmin: true });

      return persistSessionStatusUpdate({
        supabase,
        courseId,
        sessionId,
        userId: auth.userId,
        previousStatus: existing.status,
        targetStatus: status,
        payload,
        role: "admin",
      });
    }

    const instructorId = await getCurrentInstructorId();

    if (!instructorId) {
      return sessionStatusFailure("לא נמצא פרופיל מדריך.");
    }

    const instructorClient = supabase as unknown as typeof supabase & {
      from: (relation: string) => ReturnType<typeof supabase.from>;
    };

    const { data: sessionRow, error: fetchError } = await instructorClient
      .from("instructor_sessions")
      .select("session_date, start_time, status")
      .eq("id", sessionId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (fetchError) {
      return mapUpdateError(fetchError);
    }

    const session = sessionRow as {
      session_date: string;
      start_time: string;
      status: string;
    } | null;

    if (!session) {
      return sessionStatusFailure("המפגש לא נמצא.");
    }

    if (!hasSessionStarted(session.session_date, session.start_time)) {
      return sessionStatusFailure(INSTRUCTOR_STATUS_TOO_EARLY_ERROR);
    }

    return persistInstructorSessionStatusViaRpc({
      supabase,
      courseId,
      sessionId,
      userId: auth.userId,
      instructorId,
      previousStatus: session.status,
      targetStatus: status,
    });
  } catch (unknown) {
    console.error("[updateSimpleSessionStatusAction]", unknown);
    return sessionStatusFailure(STATUS_UPDATE_GENERIC_ERROR);
  }
}

/** @deprecated Use updateSimpleSessionStatusAction */
export async function adminQuickStatusAction(
  courseId: string,
  sessionId: string,
  status: SessionStatus,
): Promise<SessionStatusActionResult> {
  const parsed = parseSimpleSessionStatusInput(status);

  if (!parsed) {
    return sessionStatusFailure("סטטוס מפגש אינו תקין.");
  }

  return updateSimpleSessionStatusAction(courseId, sessionId, parsed);
}

export async function confirmArrivalAction(
  courseId: string,
  sessionId: string,
): Promise<SessionStatusActionResult> {
  try {
    const auth = await requireAuthForAction();

    if (!auth.ok) {
      return sessionStatusFailure(auth.error);
    }

    const ownership = await assertInstructorOwnsSession(courseId, sessionId);

    if (!ownership.ok) {
      return sessionStatusFailure(ownership.error);
    }

    const supabase = await createServerSupabaseClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("sessions")
      .update({ status: "arrived", actual_arrival_time: now })
      .eq("id", sessionId);

    if (error) {
      return mapUpdateError(error);
    }

    revalidateSessionPaths(courseId);
    return sessionStatusSuccess(SESSION_ACTION_SUCCESS.arrival);
  } catch (unknown) {
    console.error("[confirmArrivalAction]", unknown);
    return sessionStatusFailure(STATUS_UPDATE_GENERIC_ERROR);
  }
}

export async function confirmSessionStartedAction(
  courseId: string,
  sessionId: string,
): Promise<SessionStatusActionResult> {
  try {
    const auth = await requireAuthForAction();

    if (!auth.ok) {
      return sessionStatusFailure(auth.error);
    }

    const ownership = await assertInstructorOwnsSession(courseId, sessionId);

    if (!ownership.ok) {
      return sessionStatusFailure(ownership.error);
    }

    const supabase = await createServerSupabaseClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("sessions")
      .update({ status: "in_progress", actual_start_time: now })
      .eq("id", sessionId);

    if (error) {
      return mapUpdateError(error);
    }

    revalidateSessionPaths(courseId);
    return sessionStatusSuccess(SESSION_ACTION_SUCCESS.start);
  } catch (unknown) {
    console.error("[confirmSessionStartedAction]", unknown);
    return sessionStatusFailure(STATUS_UPDATE_GENERIC_ERROR);
  }
}

export async function confirmSessionEndedAction(
  courseId: string,
  sessionId: string,
): Promise<SessionStatusActionResult> {
  try {
    const auth = await requireAuthForAction();

    if (!auth.ok) {
      return sessionStatusFailure(auth.error);
    }

    const ownership = await assertInstructorOwnsSession(courseId, sessionId);

    if (!ownership.ok) {
      return sessionStatusFailure(ownership.error);
    }

    const supabase = await createServerSupabaseClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("sessions")
      .update({ status: "completed", actual_end_time: now })
      .eq("id", sessionId);

    if (error) {
      return mapUpdateError(error);
    }

    revalidateSessionPaths(courseId);
    return sessionStatusSuccess(SESSION_ACTION_SUCCESS.end);
  } catch (unknown) {
    console.error("[confirmSessionEndedAction]", unknown);
    return sessionStatusFailure(STATUS_UPDATE_GENERIC_ERROR);
  }
}
