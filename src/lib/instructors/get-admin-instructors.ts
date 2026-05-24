import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminInstructorListItem = {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  email: string;
  approval_status: "approved" | "pending" | "rejected" | "none";
  is_active: boolean;
};

export async function getAdminInstructors(): Promise<AdminInstructorListItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data: instructors, error } = await supabase
    .from("instructors")
    .select("id, user_id, full_name, phone, email")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const userIds = (instructors ?? [])
    .map((row) => row.user_id)
    .filter((id): id is string => Boolean(id));

  const profileByUserId = new Map<
    string,
    { approval_status: "pending" | "approved" | "rejected"; notifications_enabled: boolean }
  >();

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, approval_status, notifications_enabled")
      .in("id", userIds);

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    for (const profile of profiles ?? []) {
      profileByUserId.set(profile.id, {
        approval_status: profile.approval_status,
        notifications_enabled: profile.notifications_enabled,
      });
    }
  }

  return (instructors ?? []).map((row) => {
    const profile = row.user_id ? profileByUserId.get(row.user_id) : null;

    return {
      id: row.id,
      user_id: row.user_id,
      full_name: row.full_name,
      phone: row.phone,
      email: row.email,
      approval_status: profile?.approval_status ?? "none",
      is_active: profile ? profile.notifications_enabled : true,
    };
  });
}
