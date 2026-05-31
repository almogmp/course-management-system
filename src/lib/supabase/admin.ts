import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export type SupabaseAdminClient = ReturnType<typeof createClient<Database>>;

export const SERVICE_ROLE_MISSING_MESSAGE =
  "חסר מפתח שירות בשרת (SUPABASE_SERVICE_ROLE_KEY). יש להגדיר ב-Vercel ולנסות שוב." as const;

export type AdminClientResult =
  | { ok: true; client: SupabaseAdminClient }
  | { ok: false; error: string };

/** Service-role client — server-only. Never import from client components. */
export function createSupabaseAdminClient(): SupabaseAdminClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error(SERVICE_ROLE_MISSING_MESSAGE);
  }

  const { url } = getSupabasePublicEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Safe wrapper — returns Hebrew error instead of throwing when service role is missing. */
export function tryCreateSupabaseAdminClient(): AdminClientResult {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    return { ok: false, error: SERVICE_ROLE_MISSING_MESSAGE };
  }

  try {
    return { ok: true, client: createSupabaseAdminClient() };
  } catch (error) {
    const message = error instanceof Error ? error.message : SERVICE_ROLE_MISSING_MESSAGE;
    return { ok: false, error: message };
  }
}
