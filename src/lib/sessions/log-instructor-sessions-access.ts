import "server-only";

import { getCurrentSchoolYearStartYear, getSchoolYear } from "@/lib/school-year";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InstructorSessionsAccessLog = {
  context: string;
  authEmail: string | null;
  profileRole: string | null;
  approvalStatus: string | null;
  notificationsEnabled: boolean | null;
  instructorId: string | null;
  instructorIdByEmail: string | null;
  instructorUserIdLinked: boolean;
  instructorIsActive: boolean | null;
  activeSchoolYear: string;
  dateRange: { start: string; end: string } | null;
  instructorSessionsRowCount: number;
  queryError: string | null;
};

/** Server-only diagnostic log for instructor_sessions access (no financial fields). */
export async function logInstructorSessionsAccess(
  context: string,
  options?: { startDate?: string; endDate?: string },
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const activeSchoolYear = getSchoolYear(getCurrentSchoolYearStartYear()).label;

  if (!user) {
    console.info("[instructor-sessions-access]", { context, authEmail: null, activeSchoolYear });
    return;
  }

  const normalizedEmail = user.email?.trim().toLowerCase() ?? null;

  const [{ data: profile }, { data: instructorByUserId }, { data: instructorByEmail }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("role, approval_status, notifications_enabled")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("instructors")
        .select("id, is_active, user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      normalizedEmail
        ? supabase
            .from("instructors")
            .select("id, is_active, user_id")
            .eq("email", normalizedEmail)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

  const instructorClient = supabase as unknown as typeof supabase & {
    from: (relation: string) => ReturnType<typeof supabase.from>;
  };

  let query = instructorClient.from("instructor_sessions").select("id", { count: "exact", head: true });

  if (options?.startDate) {
    query = query.gte("session_date", options.startDate);
  }

  if (options?.endDate) {
    query = query.lte("session_date", options.endDate);
  }

  const { count, error } = await query;

  const payload: InstructorSessionsAccessLog = {
    context,
    authEmail: user.email ?? null,
    profileRole: profile?.role ?? null,
    approvalStatus: profile?.approval_status ?? null,
    notificationsEnabled: profile?.notifications_enabled ?? null,
    instructorId: instructorByUserId?.id ?? null,
    instructorIdByEmail: instructorByEmail?.id ?? null,
    instructorUserIdLinked: instructorByEmail?.user_id === user.id,
    instructorIsActive: instructorByUserId?.is_active ?? instructorByEmail?.is_active ?? null,
    activeSchoolYear,
    dateRange:
      options?.startDate && options?.endDate
        ? { start: options.startDate, end: options.endDate }
        : null,
    instructorSessionsRowCount: count ?? 0,
    queryError: error?.message ?? null,
  };

  console.info("[instructor-sessions-access]", payload);
}
