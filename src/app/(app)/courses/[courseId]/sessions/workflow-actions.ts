"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireAuth } from "@/lib/auth/guards";
import { getCurrentInstructorId } from "@/lib/auth/instructor";
import { hasSessionEnded } from "@/lib/sessions/session-workflow";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SessionWorkflowFormState = {
  success?: boolean;
  error?: string | null;
};

function revalidateSessionPaths(courseId: string) {
  revalidatePath(`/courses/${courseId}/sessions`);
  revalidatePath("/dashboard");
}

async function assertInstructorOwnsSession(
  courseId: string,
  sessionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const instructorId = await getCurrentInstructorId();

  if (!instructorId) {
    return { ok: false, error: "לא נמצא פרופיל מדריך." };
  }

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
    return { ok: false, error: error.message };
  }

  const row = data as { id: string; course_id: string } | null;

  if (!row || row.course_id !== courseId) {
    return { ok: false, error: "אין הרשאה לעדכן מפגש זה." };
  }

  return { ok: true };
}

export async function markSessionCompletedAction(
  courseId: string,
  sessionId: string,
  _prevState: SessionWorkflowFormState,
  formData: FormData,
): Promise<SessionWorkflowFormState> {
  await requireAuth();

  const ownership = await assertInstructorOwnsSession(courseId, sessionId);

  if (!ownership.ok) {
    return { error: ownership.error };
  }

  const completionNotes = String(formData.get("completion_notes") ?? "").trim();
  const supabase = await createServerSupabaseClient();
  const instructorClient = supabase as unknown as typeof supabase & {
    from: (relation: string) => ReturnType<typeof supabase.from>;
  };

  const { data: session, error: fetchError } = await instructorClient
    .from("instructor_sessions")
    .select("session_date, end_time, status")
    .eq("id", sessionId)
    .maybeSingle();

  const sessionRow = session as {
    session_date: string;
    end_time: string;
    status: string;
  } | null;

  if (fetchError || !sessionRow) {
    return { error: fetchError?.message ?? "המפגש לא נמצא." };
  }

  if (sessionRow.status === "completed") {
    return { error: "המפגש כבר מסומן כבוצע." };
  }

  if (!hasSessionEnded(sessionRow.session_date, sessionRow.end_time)) {
    return { error: "ניתן לסמן כבוצע רק לאחר סיום המפגש." };
  }

  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "completed",
      cancellation_reason: completionNotes || null,
    })
    .eq("id", sessionId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidateSessionPaths(courseId);
  return { success: true };
}

export async function instructorMarkCancelledAction(
  courseId: string,
  sessionId: string,
  _prevState: SessionWorkflowFormState,
  formData: FormData,
): Promise<SessionWorkflowFormState> {
  await requireAuth();

  const ownership = await assertInstructorOwnsSession(courseId, sessionId);

  if (!ownership.ok) {
    return { error: ownership.error };
  }

  const reason = String(formData.get("cancellation_reason") ?? "").trim();

  if (!reason) {
    return { error: "יש לציין סיבת ביטול." };
  }

  const supabase = await createServerSupabaseClient();

  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "cancelled",
      cancellation_reason: reason,
    })
    .eq("id", sessionId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidateSessionPaths(courseId);
  return { success: true };
}

export async function requestSessionCancellationAction(
  courseId: string,
  sessionId: string,
  _prevState: SessionWorkflowFormState,
  formData: FormData,
): Promise<SessionWorkflowFormState> {
  await requireAuth();

  const ownership = await assertInstructorOwnsSession(courseId, sessionId);

  if (!ownership.ok) {
    return { error: ownership.error };
  }

  const reason = String(formData.get("cancellation_reason") ?? "").trim();

  if (!reason) {
    return { error: "יש לציין סיבת בקשת הביטול." };
  }

  const supabase = await createServerSupabaseClient();
  const instructorClient = supabase as unknown as typeof supabase & {
    from: (relation: string) => ReturnType<typeof supabase.from>;
  };

  const { data: session, error: fetchError } = await instructorClient
    .from("instructor_sessions")
    .select("status")
    .eq("id", sessionId)
    .maybeSingle();

  const sessionRow = session as { status: string } | null;

  if (fetchError || !sessionRow) {
    return { error: fetchError?.message ?? "המפגש לא נמצא." };
  }

  if (sessionRow.status !== "planned") {
    return { error: "ניתן לבקש ביטול רק למפגש מתוכנן." };
  }

  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "deferred",
      cancellation_reason: reason,
    })
    .eq("id", sessionId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidateSessionPaths(courseId);
  return { success: true };
}

export async function adminApproveCancellationAction(
  courseId: string,
  sessionId: string,
): Promise<SessionWorkflowFormState> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("status, cancellation_reason")
    .eq("id", sessionId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (fetchError || !session) {
    return { error: fetchError?.message ?? "המפגש לא נמצא." };
  }

  if (session.status !== "deferred") {
    return { error: "המפגש אינו ממתין לאישור ביטול." };
  }

  const reason = session.cancellation_reason?.trim();

  if (!reason) {
    return { error: "חסרה סיבת ביטול לאישור." };
  }

  const { error: updateError } = await supabase
    .from("sessions")
    .update({ status: "cancelled" })
    .eq("id", sessionId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidateSessionPaths(courseId);
  return { success: true };
}

export async function adminReturnSessionToPlannedAction(
  courseId: string,
  sessionId: string,
): Promise<SessionWorkflowFormState> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "planned",
      cancellation_reason: null,
    })
    .eq("id", sessionId)
    .eq("course_id", courseId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidateSessionPaths(courseId);
  return { success: true };
}

export async function adminMarkSessionCompletedAction(
  courseId: string,
  sessionId: string,
): Promise<SessionWorkflowFormState> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();

  const { error: updateError } = await supabase
    .from("sessions")
    .update({ status: "completed" })
    .eq("id", sessionId)
    .eq("course_id", courseId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidateSessionPaths(courseId);
  return { success: true };
}
