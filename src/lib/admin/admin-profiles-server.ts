import "server-only";

import { isAdminEmail } from "@/config/admin";
import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin";

export type AuthProfileShape = {
  role: "admin" | "instructor";
  approval_status: "pending" | "approved" | "rejected";
};

export type ProfileRow = {
  id: string;
  email: string;
  role: "admin" | "instructor";
  approval_status: "pending" | "approved" | "rejected";
};

type ProfileSelectColumns = "id, email, role, approval_status";

const PROFILE_COLUMNS = "id, email, role, approval_status" satisfies ProfileSelectColumns;

/** Temporary production debugging — every profiles read on admin instructors flow. */
export function logAdminInstructorsProfileQuery(
  context: string,
  details: Record<string, unknown>,
  error?: unknown,
): void {
  console.error("ADMIN_INSTRUCTORS_PROFILE_QUERY", {
    context,
    client: "service_role",
    ...details,
    error:
      error instanceof Error
        ? { message: error.message, name: error.name }
        : error ?? null,
  });
}

function authProfileFromRow(row: ProfileRow): AuthProfileShape {
  return {
    role: row.role,
    approval_status: row.approval_status,
  };
}

/**
 * Server-only profiles read (service role). Caller must gate with requireAdmin() or
 * restrict to the authenticated user's id / admin page loaders.
 */
export async function adminSelectProfilesByIds(
  context: string,
  userIds: string[],
): Promise<{ ok: true; profiles: ProfileRow[] } | { ok: false; error: string }> {
  if (userIds.length === 0) {
    return { ok: true, profiles: [] };
  }

  const adminResult = tryCreateSupabaseAdminClient();

  if (!adminResult.ok) {
    logAdminInstructorsProfileQuery(context, { userIds, phase: "client" }, adminResult.error);
    return { ok: false, error: adminResult.error };
  }

  const { data, error } = await adminResult.client
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .in("id", userIds);

  if (error) {
    logAdminInstructorsProfileQuery(context, { userIds, phase: "query" }, error);
    return { ok: false, error: error.message };
  }

  logAdminInstructorsProfileQuery(context, { userIds, rowCount: data?.length ?? 0, phase: "ok" });
  return { ok: true, profiles: (data ?? []) as ProfileRow[] };
}

export async function adminSelectProfilesByRole(
  context: string,
  role: "admin" | "instructor",
  filters?: { approval_status?: "pending" | "approved" | "rejected" },
): Promise<{ ok: true; profiles: ProfileRow[] } | { ok: false; error: string }> {
  const adminResult = tryCreateSupabaseAdminClient();

  if (!adminResult.ok) {
    logAdminInstructorsProfileQuery(context, { role, phase: "client" }, adminResult.error);
    return { ok: false, error: adminResult.error };
  }

  let query = adminResult.client.from("profiles").select(PROFILE_COLUMNS).eq("role", role);

  if (filters?.approval_status) {
    query = query.eq("approval_status", filters.approval_status);
  }

  const { data, error } = await query.order("email");

  if (error) {
    logAdminInstructorsProfileQuery(context, { role, phase: "query" }, error);
    return { ok: false, error: error.message };
  }

  logAdminInstructorsProfileQuery(context, { role, rowCount: data?.length ?? 0, phase: "ok" });
  return { ok: true, profiles: (data ?? []) as ProfileRow[] };
}

/**
 * Load the signed-in user's profile via service role (by auth user id only).
 */
export async function adminSelectOwnProfile(
  context: string,
  userId: string,
  userEmail?: string,
): Promise<AuthProfileShape | null> {
  const result = await adminSelectProfilesByIds(context, [userId]);

  if (!result.ok) {
    if (userEmail && isAdminEmail(userEmail)) {
      logAdminInstructorsProfileQuery(context, { userId, fallback: "config_admin_email" });
      return { role: "admin", approval_status: "approved" };
    }

    return null;
  }

  const row = result.profiles[0];

  if (!row) {
    if (userEmail && isAdminEmail(userEmail)) {
      logAdminInstructorsProfileQuery(context, { userId, fallback: "config_admin_email_no_row" });
      return { role: "admin", approval_status: "approved" };
    }

    return null;
  }

  return authProfileFromRow(row);
}

export async function adminUpdateProfile(
  context: string,
  userId: string,
  patch: { notifications_enabled?: boolean; approval_status?: "approved" | "pending" | "rejected" },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const adminResult = tryCreateSupabaseAdminClient();

  if (!adminResult.ok) {
    logAdminInstructorsProfileQuery(context, { userId, phase: "update_client" }, adminResult.error);
    return { ok: false, error: adminResult.error };
  }

  const { error } = await adminResult.client.from("profiles").update(patch).eq("id", userId);

  if (error) {
    logAdminInstructorsProfileQuery(context, { userId, phase: "update" }, error);
    return { ok: false, error: error.message };
  }

  logAdminInstructorsProfileQuery(context, { userId, phase: "update_ok" });
  return { ok: true };
}
