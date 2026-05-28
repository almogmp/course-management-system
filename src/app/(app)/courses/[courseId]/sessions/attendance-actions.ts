"use server";

import { revalidatePath } from "next/cache";

import type { SessionStatus } from "@/components/sessions/constants";
import { isAdminEmail } from "@/config/admin";
import { requireAuth } from "@/lib/auth/guards";
import { getCurrentInstructorId } from "@/lib/auth/instructor";
import { getAuthSnapshot } from "@/lib/auth/session";
import { mapSessionActionError } from "@/lib/sessions/action-messages";
import {
  hasSessionStarted,
  INSTRUCTOR_STATUS_TOO_EARLY_ERROR,
  parseSimpleSessionStatusInput,
  toDbSimpleSessionStatus,
  type SessionsListAdminStatusValue,
} from "@/lib/sessions/simple-session-status";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type AttendanceActionState = {
  success?: boolean;
  error?: string | null;
};

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

function mapUpdateError(error: { message: string }): AttendanceActionState {
  return { error: mapSessionActionError(error.message) };
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
): Promise<AttendanceActionState> {
  await requireAuth();

  const status = toDbSimpleSessionStatus(statusInput);
  const parsed = parseSimpleSessionStatusInput(status);

  if (!parsed) {
    return { error: "סטטוס מפגש אינו תקין." };
  }

  const { user, isAdmin } = await getAuthSnapshot();
  const asAdmin = Boolean(isAdmin && user?.email && isAdminEmail(user.email));

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
      return { error: "המפגש לא נמצא." };
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
    return { success: true };
  }

  const instructorId = await getCurrentInstructorId();

  if (!instructorId) {
    return { error: "לא נמצא פרופיל מדריך." };
  }

  const ownership = await assertInstructorOwnsSession(courseId, sessionId);

  if (!ownership.ok) {
    return { error: ownership.error };
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
    return { error: "המפגש לא נמצא." };
  }

  if (!hasSessionStarted(existing.session_date, existing.start_time)) {
    return { error: INSTRUCTOR_STATUS_TOO_EARLY_ERROR };
  }

  const payload = buildSimpleStatusPayload(status, existing, { asAdmin: false });

  const { error } = await supabase.from("sessions").update(payload).eq("id", sessionId);

  if (error) {
    return mapUpdateError(error);
  }

  revalidateSessionPaths(courseId);
  return { success: true };
}

/** @deprecated Use updateSimpleSessionStatusAction */
export async function adminQuickStatusAction(
  courseId: string,
  sessionId: string,
  status: SessionStatus,
): Promise<AttendanceActionState> {
  const parsed = parseSimpleSessionStatusInput(status);

  if (!parsed) {
    return { error: "סטטוס מפגש אינו תקין." };
  }

  return updateSimpleSessionStatusAction(courseId, sessionId, parsed);
}

export async function confirmArrivalAction(
  courseId: string,
  sessionId: string,
): Promise<AttendanceActionState> {
  await requireAuth();

  const ownership = await assertInstructorOwnsSession(courseId, sessionId);

  if (!ownership.ok) {
    return { error: ownership.error };
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
  return { success: true };
}

export async function confirmSessionStartedAction(
  courseId: string,
  sessionId: string,
): Promise<AttendanceActionState> {
  await requireAuth();

  const ownership = await assertInstructorOwnsSession(courseId, sessionId);

  if (!ownership.ok) {
    return { error: ownership.error };
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
  return { success: true };
}

export async function confirmSessionEndedAction(
  courseId: string,
  sessionId: string,
): Promise<AttendanceActionState> {
  await requireAuth();

  const ownership = await assertInstructorOwnsSession(courseId, sessionId);

  if (!ownership.ok) {
    return { error: ownership.error };
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
  return { success: true };
}
