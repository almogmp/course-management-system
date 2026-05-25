import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export type SupabaseAdminClient = ReturnType<typeof createClient<Database>>;

/** Service-role client — server-only. Never import from client components. */
export function createSupabaseAdminClient(): SupabaseAdminClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error(
      "חסר משתנה סביבה SUPABASE_SERVICE_ROLE_KEY. הגדר אותו ב-.env.local (שרת בלבד).",
    );
  }

  const { url } = getSupabasePublicEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
