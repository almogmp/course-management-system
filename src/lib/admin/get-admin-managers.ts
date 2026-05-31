import "server-only";

import { ADMIN_EMAILS } from "@/config/admin";
import { adminSelectProfilesByRole } from "@/lib/admin/admin-profiles-server";
import { logServerError } from "@/lib/errors/safe-error-message";

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
  const profilesResult = await adminSelectProfilesByRole("getAdminManagers", "admin");

  if (!profilesResult.ok) {
    logServerError("getAdminManagers.profiles", profilesResult.error);
    return { ok: false, error: LOAD_ERROR_MESSAGE };
  }

  const allowed = new Set(ADMIN_EMAILS.map((e) => e.toLowerCase()));

  return {
    ok: true,
    managers: profilesResult.profiles
      .filter((row) => allowed.has(row.email.toLowerCase()))
      .map((row) => ({
        id: row.id,
        email: row.email,
        approval_status: row.approval_status,
      })),
  };
}
