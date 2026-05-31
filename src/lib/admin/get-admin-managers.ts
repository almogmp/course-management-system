import "server-only";

import { ADMIN_EMAILS } from "@/config/admin";
import { logServerError } from "@/lib/errors/safe-error-message";
import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminManagerRow = {
  id: string;
  email: string;
  approval_status: string;
};

export type AdminManagersLoadResult =
  | { ok: true; managers: AdminManagerRow[] }
  | { ok: false; error: string };

const LOAD_ERROR_MESSAGE =
  "לא ניתן לטעון את רשימת מנהלי המערכת. נסו לרענן את הדף.";

/**
 * Super-admin panel data — service role server-side only (page guarded by requireAdmin).
 */
export async function getAdminManagers(): Promise<AdminManagersLoadResult> {
  const adminResult = tryCreateSupabaseAdminClient();

  if (!adminResult.ok) {
    logServerError("getAdminManagers.serviceRole", adminResult.error);
    return { ok: false, error: adminResult.error };
  }

  const supabase = adminResult.client;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, approval_status")
    .eq("role", "admin")
    .order("email");

  if (error) {
    logServerError("getAdminManagers.profiles", error);
    return { ok: false, error: LOAD_ERROR_MESSAGE };
  }

  const allowed = new Set(ADMIN_EMAILS.map((e) => e.toLowerCase()));

  return {
    ok: true,
    managers: (data ?? []).filter((row) => allowed.has(row.email.toLowerCase())),
  };
}
