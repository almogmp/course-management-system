import "server-only";

import { logServerError } from "@/lib/errors/safe-error-message";
import { tryCreateSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminInstructorListItem = {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  email: string;
  profile_email: string | null;
  profile_role: string | null;
  approval_status: "approved" | "pending" | "rejected" | "none";
  is_active: boolean;
};

export type AdminInstructorsLoadResult =
  | { ok: true; instructors: AdminInstructorListItem[] }
  | { ok: false; error: string };

const LOAD_ERROR_MESSAGE =
  "לא ניתן לטעון את רשימת המדריכים כרגע. נסו לרענן את הדף. אם הבעיה נמשכת, פנו למנהל המערכת.";

/**
 * Loads instructor list + linked profile fields for /admin/instructors only.
 * Uses service role server-side (after requireAdmin) — avoids profiles RLS/GRANT
 * failures when is_admin() is false or authenticated lacks table GRANT.
 */
export async function getAdminInstructors(): Promise<AdminInstructorsLoadResult> {
  const adminResult = tryCreateSupabaseAdminClient();

  if (!adminResult.ok) {
    logServerError("getAdminInstructors.serviceRole", adminResult.error);
    return { ok: false, error: adminResult.error };
  }

  const supabase = adminResult.client;

  const { data: instructors, error: instructorsError } = await supabase
    .from("instructors")
    .select("id, user_id, full_name, phone, email, is_active")
    .order("full_name", { ascending: true });

  if (instructorsError) {
    logServerError("getAdminInstructors.instructors", instructorsError);
    return { ok: false, error: LOAD_ERROR_MESSAGE };
  }

  const userIds = (instructors ?? [])
    .map((row) => row.user_id)
    .filter((id): id is string => Boolean(id));

  const profileByUserId = new Map<
    string,
    {
      email: string;
      role: string;
      approval_status: "pending" | "approved" | "rejected";
    }
  >();

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, role, approval_status")
      .in("id", userIds);

    if (profilesError) {
      logServerError("getAdminInstructors.profiles", profilesError);
      return { ok: false, error: LOAD_ERROR_MESSAGE };
    }

    for (const profile of profiles ?? []) {
      profileByUserId.set(profile.id, {
        email: profile.email,
        role: profile.role,
        approval_status: profile.approval_status,
      });
    }
  }

  const items: AdminInstructorListItem[] = (instructors ?? []).map((row) => {
    const profile = row.user_id ? profileByUserId.get(row.user_id) : null;

    return {
      id: row.id,
      user_id: row.user_id,
      full_name: row.full_name,
      phone: row.phone,
      email: row.email,
      profile_email: profile?.email ?? null,
      profile_role: profile?.role ?? null,
      approval_status: profile?.approval_status ?? "none",
      is_active: row.is_active,
    };
  });

  return { ok: true, instructors: items };
}
