"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { mapFormStatusToDb, type SessionStatus } from "@/components/sessions/constants";
import { requireAdmin, requireAuth } from "@/lib/auth/guards";
import { instructorExists } from "@/lib/instructors/get-instructors-for-select";
import { resolveSessionSubstituteInstructorId } from "@/lib/sessions/instructor-assignment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];
type SessionUpdate = Database["public"]["Tables"]["sessions"]["Update"];

export type CreateSessionFormState = {
  success?: boolean;
  error?: string | null;
};

export type UpdateSessionFormState = {
  success?: boolean;
  error?: string | null;
};

const DELETE_PERMISSION_ERROR =
  "לא ניתן למחוק את המפגש כרגע. יש לבדוק הרשאות מחיקה.";

const UPDATE_PERMISSION_ERROR =
  "לא ניתן לעדכן את המפגש כרגע. יש לבדוק הרשאות עדכון.";

type ParsedSessionForm = {
  sessionDate: string;
  startTime: string;
  endTime: string;
  instructorHours: number;
  companyHours: number;
  status: SessionStatus;
  notes: string;
};

function courseSessionsPath(courseId: string, query?: { error?: string; success?: string }) {
  const params = new URLSearchParams();

  if (query?.error) {
    params.set("error", query.error);
  }

  if (query?.success) {
    params.set("success", query.success);
  }

  const search = params.toString();
  return search ? `/courses/${courseId}/sessions?${search}` : `/courses/${courseId}/sessions`;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function redirectWithError(courseId: string, message: string): never {
  redirect(courseSessionsPath(courseId, { error: message }));
}

function parseAndValidateSessionForm(
  formData: FormData,
): { ok: true; data: ParsedSessionForm } | { ok: false; error: string } {
  const sessionDate = String(formData.get("session_date") ?? "").trim();
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const formStatus = String(formData.get("status") ?? "scheduled").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const instructorHoursRaw = String(formData.get("instructor_hours") ?? "").trim();
  const companyHoursRaw = String(formData.get("company_hours") ?? "").trim();

  if (
    !sessionDate ||
    !startTime ||
    !endTime ||
    !instructorHoursRaw ||
    !companyHoursRaw
  ) {
    return { ok: false, error: "יש למלא את כל השדות החובה." };
  }

  const instructorHours = Number(instructorHoursRaw);
  const companyHours = Number(companyHoursRaw);
  const status = mapFormStatusToDb(formStatus);

  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    return { ok: false, error: "שעת הסיום חייבת להיות אחרי שעת ההתחלה." };
  }

  if (Number.isNaN(instructorHours) || instructorHours < 0) {
    return { ok: false, error: "שעות מדריך חייבות להיות מספר שאינו שלילי." };
  }

  if (Number.isNaN(companyHours) || companyHours < 0) {
    return { ok: false, error: "שעות חברה חייבות להיות מספר שאינו שלילי." };
  }

  if (!status) {
    return { ok: false, error: "סטטוס מפגש אינו תקין." };
  }

  if (status === "cancelled" && !notes) {
    return { ok: false, error: "לביטול מפגש יש למלא הערות עם סיבת הביטול." };
  }

  if (status === "deferred" && !notes) {
    return { ok: false, error: "למפגש ממתין לאישור יש לציין הערה או סיבה." };
  }

  return {
    ok: true,
    data: {
      sessionDate,
      startTime,
      endTime,
      instructorHours,
      companyHours,
      status,
      notes,
    },
  };
}

function parseAssignedInstructorId(formData: FormData): string | null {
  const assignedInstructorId = String(formData.get("assigned_instructor_id") ?? "").trim();

  if (!assignedInstructorId) {
    return null;
  }

  return assignedInstructorId;
}

export async function createSessionAction(
  courseId: string,
  _prevState: CreateSessionFormState,
  formData: FormData,
): Promise<CreateSessionFormState> {
  await requireAuth();

  if (!courseId.trim()) {
    return { error: "מזהה קורס חסר." };
  }

  const parsed = parseAndValidateSessionForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const { sessionDate, startTime, endTime, instructorHours, companyHours, status, notes } =
    parsed.data;

  const assignedInstructorId = parseAssignedInstructorId(formData);

  if (!assignedInstructorId) {
    return { error: "יש לבחור רכז למפגש." };
  }

  const supabase = await createServerSupabaseClient();

  const instructorIsValid = await instructorExists(supabase, assignedInstructorId);

  if (!instructorIsValid) {
    return { error: "הרכז שנבחר אינו קיים במערכת." };
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, school_year, lead_instructor_id")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    return { error: courseError.message };
  }

  if (!course) {
    return { error: "הקורס לא נמצא." };
  }

  if (!course.lead_instructor_id) {
    return { error: "לקורס חסר מדריך מוביל." };
  }

  const payload: SessionInsert = {
    course_id: courseId,
    session_date: sessionDate,
    start_time: startTime,
    end_time: endTime,
    instructor_hours: instructorHours,
    company_hours: companyHours,
    status,
    school_year: course.school_year,
    admin_note: notes || null,
    cancellation_reason:
      status === "cancelled" || status === "deferred" ? notes : null,
    substitute_instructor_id: resolveSessionSubstituteInstructorId(
      assignedInstructorId,
      course.lead_instructor_id,
    ),
  };

  const { error: insertError } = await supabase.from("sessions").insert(payload);

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/courses/${courseId}/sessions`);
  return { success: true };
}

export async function updateSessionAction(
  courseId: string,
  sessionId: string,
  _prevState: UpdateSessionFormState,
  formData: FormData,
): Promise<UpdateSessionFormState> {
  await requireAdmin();

  if (!courseId.trim()) {
    return { error: "מזהה קורס חסר." };
  }

  if (!sessionId.trim()) {
    return { error: "מזהה מפגש חסר." };
  }

  const parsed = parseAndValidateSessionForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const { sessionDate, startTime, endTime, instructorHours, companyHours, status, notes } =
    parsed.data;

  const assignedInstructorId = parseAssignedInstructorId(formData);

  if (!assignedInstructorId) {
    return { error: "יש לבחור רכז למפגש." };
  }

  const supabase = await createServerSupabaseClient();

  const instructorIsValid = await instructorExists(supabase, assignedInstructorId);

  if (!instructorIsValid) {
    return { error: "הרכז שנבחר אינו קיים במערכת." };
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, lead_instructor_id")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    return { error: courseError.message };
  }

  if (!course) {
    return { error: "הקורס לא נמצא." };
  }

  if (!course.lead_instructor_id) {
    return { error: "לקורס חסר מדריך מוביל." };
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, course_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    return {
      error:
        sessionError.message.includes("policy") || sessionError.code === "42501"
          ? UPDATE_PERMISSION_ERROR
          : sessionError.message,
    };
  }

  if (!session) {
    return { error: "המפגש לא נמצא." };
  }

  if (session.course_id !== courseId) {
    return { error: "המפגש אינו שייך לקורס זה." };
  }

  const payload: SessionUpdate = {
    session_date: sessionDate,
    start_time: startTime,
    end_time: endTime,
    instructor_hours: instructorHours,
    company_hours: companyHours,
    status,
    admin_note: notes || null,
    cancellation_reason:
      status === "cancelled" || status === "deferred" ? notes : null,
    substitute_instructor_id: resolveSessionSubstituteInstructorId(
      assignedInstructorId,
      course.lead_instructor_id,
    ),
  };

  const { data: updated, error: updateError } = await supabase
    .from("sessions")
    .update(payload)
    .eq("id", sessionId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    return {
      error:
        updateError.message.includes("policy") || updateError.code === "42501"
          ? UPDATE_PERMISSION_ERROR
          : updateError.message,
    };
  }

  if (!updated) {
    return { error: UPDATE_PERMISSION_ERROR };
  }

  revalidatePath(`/courses/${courseId}/sessions`);
  return { success: true };
}

export async function deleteSessionAction(
  courseId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  if (!courseId.trim()) {
    redirectWithError(courseId, "מזהה קורס חסר.");
  }

  const sessionId = String(formData.get("session_id") ?? "").trim();

  if (!sessionId) {
    redirectWithError(courseId, "מזהה מפגש חסר.");
  }

  const supabase = await createServerSupabaseClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    redirectWithError(courseId, courseError.message);
  }

  if (!course) {
    redirectWithError(courseId, "הקורס לא נמצא.");
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, course_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    redirectWithError(courseId, sessionError.message);
  }

  if (!session) {
    redirectWithError(courseId, "המפגש לא נמצא.");
  }

  if (session.course_id !== courseId) {
    redirectWithError(courseId, "המפגש אינו שייך לקורס זה.");
  }

  const { error: deleteError, count } = await supabase
    .from("sessions")
    .delete({ count: "exact" })
    .eq("id", sessionId);

  if (deleteError) {
    redirectWithError(
      courseId,
      deleteError.message.includes("policy") ||
        deleteError.code === "42501" ||
        deleteError.code === "PGRST301"
        ? DELETE_PERMISSION_ERROR
        : deleteError.message,
    );
  }

  if (count === 0) {
    redirectWithError(courseId, DELETE_PERMISSION_ERROR);
  }

  revalidatePath(`/courses/${courseId}/sessions`);
  redirect(courseSessionsPath(courseId, { success: "deleted" }));
}
