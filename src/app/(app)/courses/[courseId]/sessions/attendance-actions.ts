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
          "cancellation_reason, actual_arrival_time, actual_start_time, actual_end_time",
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

      const { error } = await supabase
        .from("sessions")
        .update(payload)
        .eq("id", sessionId)
        .eq("course_id", courseId);

      if (error) {
        return mapUpdateError(error);
      }

      revalidateSessionPaths(courseId);
      return sessionStatusSuccess(SESSION_ACTION_SUCCESS.status);
    }

    const instructorId = await getCurrentInstructorId();

    if (!instructorId) {
      return sessionStatusFailure("לא נמצא פרופיל מדריך.");
    }

    const ownership = await assertInstructorOwnsSession(courseId, sessionId);

    if (!ownership.ok) {
      return sessionStatusFailure(ownership.error);
    }

    const instructorClient = supabase as unknown as typeof supabase & {
      from: (relation: string) => ReturnType<typeof supabase.from>;
    };

    const { data: sessionRow, error: fetchError } = await instructorClient
      .from("instructor_sessions")
      .select(
        "session_date, start_time, status, cancellation_reason, actual_arrival_time, actual_start_time, actual_end_time",
      )
      .eq("id", sessionId)
      .maybeSingle();

    if (fetchError) {
      return mapUpdateError(fetchError);
    }

    const existing = sessionRow as {
      session_date: string;
      start_time: string;
      status: string;
      cancellation_reason: string | null;
      actual_arrival_time: string | null;
      actual_start_time: string | null;
      actual_end_time: string | null;
    } | null;

    if (!existing) {
      return sessionStatusFailure("המפגש לא נמצא.");
    }

    if (!hasSessionStarted(existing.session_date, existing.start_time)) {
      return sessionStatusFailure(INSTRUCTOR_STATUS_TOO_EARLY_ERROR);
    }

    const payload = buildSimpleStatusPayload(status, existing, { asAdmin: false });

    const { error } = await supabase.from("sessions").update(payload).eq("id", sessionId);

    if (error) {
      return mapUpdateError(error);
    }

    revalidateSessionPaths(courseId);
    return sessionStatusSuccess(SESSION_ACTION_SUCCESS.status);
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
