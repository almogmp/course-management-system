"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireAuth } from "@/lib/auth/guards";
import { mapSessionActionError } from "@/lib/sessions/action-messages";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { SessionStatus } from "@/components/sessions/constants";

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
    .select("id, course_id, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: mapSessionActionError(error.message) };
  }

  const row = data as { id: string; course_id: string; status: string } | null;

  if (!row || row.course_id !== courseId) {
    return { ok: false, error: "אין הרשאה לעדכן מפגש זה." };
  }

  return { ok: true };
}

function mapUpdateError(error: { message: string }): AttendanceActionState {
  return { error: mapSessionActionError(error.message) };
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

export async function adminQuickStatusAction(
  courseId: string,
  sessionId: string,
  status: SessionStatus,
): Promise<AttendanceActionState> {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  const { data: existing, error: fetchError } = await supabase
    .from("sessions")
    .select("cancellation_reason, actual_arrival_time, actual_start_time, actual_end_time")
    .eq("id", sessionId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (fetchError) {
    return mapUpdateError(fetchError);
  }

  if (!existing) {
    return { error: "המפגש לא נמצא." };
  }

  const payload: Database["public"]["Tables"]["sessions"]["Update"] = { status };

  if (status === "planned") {
    payload.cancellation_reason = null;
    payload.actual_arrival_time = null;
    payload.actual_start_time = null;
    payload.actual_end_time = null;
  }

  if (status === "arrived" && !existing.actual_arrival_time) {
    payload.actual_arrival_time = now;
  }

  if (status === "in_progress") {
    if (!existing.actual_arrival_time) {
      payload.actual_arrival_time = now;
    }
    if (!existing.actual_start_time) {
      payload.actual_start_time = now;
    }
  }

  if (status === "completed") {
    if (!existing.actual_end_time) {
      payload.actual_end_time = now;
    }
  }

  if (status === "cancelled" && !existing.cancellation_reason?.trim()) {
    payload.cancellation_reason = "בוטל על ידי מנהל";
  }

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
