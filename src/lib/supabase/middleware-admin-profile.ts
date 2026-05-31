import { createClient } from "@supabase/supabase-js";

import { isAdminEmail } from "@/config/admin";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

type MiddlewareProfile = {
  role: string;
  approval_status: string;
};

/**
 * Middleware-safe profile read for /admin/* (service role when configured).
 * Does not use "server-only" so it can run on the Edge runtime.
 */
export async function getProfileForAdminMiddleware(
  userId: string,
  userEmail: string | undefined,
): Promise<MiddlewareProfile | null> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    console.error("ADMIN_INSTRUCTORS_PROFILE_QUERY", {
      context: "middleware.getProfileForAdminMiddleware",
      client: "none",
      error: "missing_service_role_key",
      userId,
    });

    if (userEmail && isAdminEmail(userEmail)) {
      return { role: "admin", approval_status: "approved" };
    }

    return null;
  }

  const { url } = getSupabasePublicEnv();
  const admin = createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin
    .from("profiles")
    .select("role, approval_status")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("ADMIN_INSTRUCTORS_PROFILE_QUERY", {
      context: "middleware.getProfileForAdminMiddleware",
      client: "service_role",
      userId,
      error: { message: error.message },
    });

    if (userEmail && isAdminEmail(userEmail)) {
      return { role: "admin", approval_status: "approved" };
    }

    return null;
  }

  if (!data) {
    if (userEmail && isAdminEmail(userEmail)) {
      return { role: "admin", approval_status: "approved" };
    }

    return null;
  }

  console.error("ADMIN_INSTRUCTORS_PROFILE_QUERY", {
    context: "middleware.getProfileForAdminMiddleware",
    client: "service_role",
    userId,
    phase: "ok",
    role: data.role,
  });

  return data;
}
