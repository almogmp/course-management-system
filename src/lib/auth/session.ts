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

/** מצב התחברות + פרופיל מ-public.profiles (RLS) */
export async function getAuthSnapshot(): Promise<AuthSnapshot> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, isAdmin: false };
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role, approval_status")
    .eq("id", user.id)
    .single();

  const profile: AuthProfile | null = profileRow
    ? {
        role: profileRow.role,
        approval_status: profileRow.approval_status,
      }
    : null;

  const isAdmin = profile?.role === "admin";

  return {
    user: { id: user.id, email: user.email ?? undefined },
    profile,
    isAdmin,
  };
}
