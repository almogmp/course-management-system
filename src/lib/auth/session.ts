import { isAdminEmail } from "@/config/admin";
import { adminSelectOwnProfile } from "@/lib/admin/admin-profiles-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthProfile = {
  role: "admin" | "instructor";
  approval_status: "pending" | "approved" | "rejected";
};

export type AuthSnapshot = {
  user: { id: string; email: string | undefined } | null;
  profile: AuthProfile | null;
  /** נקבע לפי profiles.role במסד — לא לפי מייל בלבד */
  isAdmin: boolean;
};

/** מצב התחברות + פרופיל (service role server-side — avoids profiles GRANT/RLS on authenticated). */
export async function getAuthSnapshot(): Promise<AuthSnapshot> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, isAdmin: false };
  }

  const email = user.email?.trim().toLowerCase();
  const profile = await adminSelectOwnProfile("getAuthSnapshot", user.id, email);

  const isAdmin = profile?.role === "admin" || Boolean(email && isAdminEmail(email));

  return {
    user: { id: user.id, email: user.email ?? undefined },
    profile,
    isAdmin,
  };
}
