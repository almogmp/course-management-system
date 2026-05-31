import "server-only";

import { ADMIN_EMAILS } from "@/config/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminManagerRow = {
  id: string;
  email: string;
  approval_status: string;
};

export async function getAdminManagers(): Promise<AdminManagerRow[]> {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select("id, email, approval_status")
    .eq("role", "admin")
    .order("email");

  if (error) {
    throw new Error(error.message);
  }

  const allowed = new Set(ADMIN_EMAILS.map((e) => e.toLowerCase()));

  return (data ?? []).filter((row) => allowed.has(row.email.toLowerCase()));
}
