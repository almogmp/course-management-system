import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export type SupabaseServerClient = ReturnType<typeof createServerClient<Database>>;

/** לקוח Supabase לשרת (Server Components, Server Actions, Route Handlers) */
export async function createServerSupabaseClient(): Promise<SupabaseServerClient> {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // נקרא מתוך Server Component ללא mutating cookies — מתעלמים
        }
      },
    },
  });
}
