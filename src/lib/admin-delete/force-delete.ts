import "server-only";

import type { AdminDeleteSupabaseClient } from "@/lib/admin-delete/supabase";
import type { AdminDeleteEntityType } from "@/lib/admin-delete/types";

async function deleteSessionsForCourse(
  client: AdminDeleteSupabaseClient,
  courseId: string,
): Promise<void> {
  const { error } = await client.from("sessions").delete().eq("course_id", courseId);

  if (error) {
    throw new Error(error.message);
  }
}

async function deleteSessionSeriesForCourse(
  client: AdminDeleteSupabaseClient,
  courseId: string,
): Promise<void> {
  const { error } = await client.from("session_series").delete().eq("course_id", courseId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function forceDeleteCourse(
  client: AdminDeleteSupabaseClient,
  courseId: string,
): Promise<void> {
  await deleteSessionsForCourse(client, courseId);
  await deleteSessionSeriesForCourse(client, courseId);

  const { error } = await client.from("courses").delete().eq("id", courseId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function forceDeleteInstitution(
  client: AdminDeleteSupabaseClient,
  institutionId: string,
): Promise<void> {
  const { data: courses, error: coursesError } = await client
    .from("courses")
    .select("id")
    .eq("institution_id", institutionId);

  if (coursesError) {
    throw new Error(coursesError.message);
  }

  for (const course of courses ?? []) {
    await forceDeleteCourse(client, course.id);
  }

  const { error: coordinatorsError } = await client
    .from("institution_coordinators")
    .delete()
    .eq("institution_id", institutionId);

  if (coordinatorsError) {
    throw new Error(coordinatorsError.message);
  }

  const { error } = await client.from("institutions").delete().eq("id", institutionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function forceDeleteSupplier(
  client: AdminDeleteSupabaseClient,
  supplierId: string,
): Promise<void> {
  const { data: institutions, error: institutionsError } = await client
    .from("institutions")
    .select("id")
    .eq("primary_supplier_id", supplierId);

  if (institutionsError) {
    throw new Error(institutionsError.message);
  }

  for (const institution of institutions ?? []) {
    await forceDeleteInstitution(client, institution.id);
  }

  const { data: courses, error: coursesError } = await client
    .from("courses")
    .select("id")
    .eq("primary_supplier_id", supplierId);

  if (coursesError) {
    throw new Error(coursesError.message);
  }

  for (const course of courses ?? []) {
    await forceDeleteCourse(client, course.id);
  }

  const { error } = await client.from("primary_suppliers").delete().eq("id", supplierId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function forceDeleteInstructor(
  client: AdminDeleteSupabaseClient,
  instructorId: string,
): Promise<void> {
  const { data: leadCourses, error: leadCoursesError } = await client
    .from("courses")
    .select("id")
    .eq("lead_instructor_id", instructorId);

  if (leadCoursesError) {
    throw new Error(leadCoursesError.message);
  }

  for (const course of leadCourses ?? []) {
    await forceDeleteCourse(client, course.id);
  }

  const { error: clearSubstituteError } = await client
    .from("sessions")
    .update({ substitute_instructor_id: null })
    .eq("substitute_instructor_id", instructorId);

  if (clearSubstituteError) {
    throw new Error(clearSubstituteError.message);
  }

  const { error } = await client.from("instructors").delete().eq("id", instructorId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function forceDeleteSession(
  client: AdminDeleteSupabaseClient,
  sessionId: string,
): Promise<void> {
  const { error } = await client.from("sessions").delete().eq("id", sessionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function forceDeleteEntity(
  client: AdminDeleteSupabaseClient,
  entityType: AdminDeleteEntityType,
  entityId: string,
): Promise<void> {
  switch (entityType) {
    case "session":
      await forceDeleteSession(client, entityId);
      return;
    case "course":
      await forceDeleteCourse(client, entityId);
      return;
    case "institution":
      await forceDeleteInstitution(client, entityId);
      return;
    case "supplier":
      await forceDeleteSupplier(client, entityId);
      return;
    case "instructor":
      await forceDeleteInstructor(client, entityId);
      return;
    default:
      throw new Error("סוג ישות לא נתמך למחיקה כפויה.");
  }
}
