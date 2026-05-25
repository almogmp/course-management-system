import "server-only";

import { getAdminDeletePreview } from "@/lib/admin-delete/dependencies";
import { forceDeleteEntity } from "@/lib/admin-delete/force-delete";
import { createAdminDeleteSupabaseClient } from "@/lib/admin-delete/supabase";
import type { AdminDeleteEntityType, AdminDeleteMode } from "@/lib/admin-delete/types";

function tableForEntity(entityType: AdminDeleteEntityType) {
  switch (entityType) {
    case "instructor":
      return "instructors" as const;
    case "course":
      return "courses" as const;
    case "institution":
      return "institutions" as const;
    case "supplier":
      return "primary_suppliers" as const;
    case "session":
      return "sessions" as const;
    default:
      throw new Error("סוג ישות לא נתמך.");
  }
}

async function assertEntityExists(
  entityType: AdminDeleteEntityType,
  entityId: string,
): Promise<void> {
  const client = await createAdminDeleteSupabaseClient();
  const table = tableForEntity(entityType);

  const { data, error } = await client.from(table).select("id").eq("id", entityId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("הרשומה לא נמצאה או שכבר נמחקה.");
  }
}

async function normalDeleteEntity(
  entityType: AdminDeleteEntityType,
  entityId: string,
): Promise<void> {
  const client = await createAdminDeleteSupabaseClient();
  const preview = await getAdminDeletePreview(client, entityType, entityId);

  if (!preview.canNormalDelete) {
    const summary = preview.items.map((item) => `${item.count} ${item.label}`).join(", ");
    throw new Error(
      `לא ניתן למחוק ${preview.entityLabel} באופן רגיל (נמצאו: ${summary}). השתמש במחיקה כפויה.`,
    );
  }

  const table = tableForEntity(entityType);

  const { data, error } = await client
    .from(table)
    .delete()
    .eq("id", entityId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("המחיקה נכשלה. ודא שיש הרשאות מחיקה למנהל.");
  }
}

export async function performAdminDelete(
  entityType: AdminDeleteEntityType,
  entityId: string,
  mode: AdminDeleteMode,
): Promise<void> {
  await assertEntityExists(entityType, entityId);

  const client = await createAdminDeleteSupabaseClient();

  if (mode === "force") {
    await forceDeleteEntity(client, entityType, entityId);
    return;
  }

  await normalDeleteEntity(entityType, entityId);
}
