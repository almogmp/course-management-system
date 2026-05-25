import "server-only";

import { createServerSupabaseClient, type SupabaseServerClient } from "@/lib/supabase/server";

/** Admin delete flows use the authenticated server client + RLS (is_admin). */
export async function createAdminDeleteSupabaseClient(): Promise<SupabaseServerClient> {
  return createServerSupabaseClient();
}

export type { SupabaseServerClient as AdminDeleteSupabaseClient };
