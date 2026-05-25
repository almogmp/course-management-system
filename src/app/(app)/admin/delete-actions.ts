"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminDeletePreview } from "@/lib/admin-delete/dependencies";
import { performAdminDelete } from "@/lib/admin-delete/perform-delete";
import {
  ADMIN_DELETE_ENTITY_TYPES,
  type AdminDeleteEntityType,
  type AdminDeleteMode,
  type AdminDeletePreview,
} from "@/lib/admin-delete/types";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminDeleteSupabaseClient } from "@/lib/admin-delete/supabase";

export type AdminDeletePreviewResult =
  | { ok: true; preview: AdminDeletePreview }
  | { ok: false; error: string };

const SUCCESS_MESSAGES: Record<AdminDeleteEntityType, string> = {
  instructor: "המדריך נמחק בהצלחה",
  course: "הקורס נמחק בהצלחה",
  institution: "המוסד נמחק בהצלחה",
  supplier: "הספק נמחק בהצלחה",
  session: "המפגש נמחק בהצלחה",
};

function isAdminDeleteEntityType(value: string): value is AdminDeleteEntityType {
  return (ADMIN_DELETE_ENTITY_TYPES as readonly string[]).includes(value);
}

function isAdminDeleteMode(value: string): value is AdminDeleteMode {
  return value === "normal" || value === "force";
}

function sanitizeReturnPath(path: string): string {
  const trimmed = path.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/dashboard";
  }

  return trimmed;
}

function redirectWithDeleteError(returnPath: string, message: string): never {
  redirect(`${returnPath}?error=${encodeURIComponent(message)}`);
}

function redirectWithDeleteSuccess(returnPath: string, entityType: AdminDeleteEntityType): never {
  redirect(
    `${returnPath}?success=deleted&message=${encodeURIComponent(SUCCESS_MESSAGES[entityType])}`,
  );
}

export async function getAdminDeletePreviewAction(
  entityType: string,
  entityId: string,
): Promise<AdminDeletePreviewResult> {
  await requireAdmin();

  if (!isAdminDeleteEntityType(entityType)) {
    return { ok: false, error: "סוג ישות לא תקין." };
  }

  const id = entityId.trim();

  if (!id) {
    return { ok: false, error: "מזהה רשומה חסר." };
  }

  try {
    const client = await createAdminDeleteSupabaseClient();
    const preview = await getAdminDeletePreview(client, entityType, id);
    return { ok: true, preview };
  } catch (error) {
    const message = error instanceof Error ? error.message : "טעינת תלויות נכשלה.";
    return { ok: false, error: message };
  }
}

export async function adminDeleteEntityAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const entityTypeRaw = String(formData.get("entity_type") ?? "");
  const entityId = String(formData.get("entity_id") ?? "").trim();
  const modeRaw = String(formData.get("mode") ?? "");
  const returnPath = sanitizeReturnPath(String(formData.get("return_path") ?? "/dashboard"));

  if (!isAdminDeleteEntityType(entityTypeRaw)) {
    redirectWithDeleteError(returnPath, "סוג ישות לא תקין.");
  }

  if (!entityId) {
    redirectWithDeleteError(returnPath, "מזהה רשומה חסר.");
  }

  if (!isAdminDeleteMode(modeRaw)) {
    redirectWithDeleteError(returnPath, "מצב מחיקה לא תקין.");
  }

  try {
    await performAdminDelete(entityTypeRaw, entityId, modeRaw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "המחיקה נכשלה.";
    redirectWithDeleteError(returnPath, message);
  }

  revalidatePath(returnPath);
  revalidatePath("/courses");
  revalidatePath("/sessions");
  revalidatePath("/institutions");
  revalidatePath("/suppliers");
  revalidatePath("/admin/instructors");
  revalidatePath("/admin/instructor-approvals");
  revalidatePath("/admin/payroll");
  revalidatePath("/admin/reports");
  revalidatePath("/dashboard");

  if (entityTypeRaw === "session") {
    const courseId = String(formData.get("course_id") ?? "").trim();

    if (courseId) {
      revalidatePath(`/courses/${courseId}/sessions`);
    }
  }

  if (entityTypeRaw === "course") {
    revalidatePath(`/courses/${entityId}/sessions`);
  }

  if (entityTypeRaw === "institution") {
    revalidatePath(`/institutions/${entityId}`);
  }

  redirectWithDeleteSuccess(returnPath, entityTypeRaw);
}
