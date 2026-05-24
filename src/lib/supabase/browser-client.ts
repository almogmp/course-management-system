import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export type SupabaseBrowserClient = ReturnType<
  typeof createBrowserClient<Database>
>;

let browserClient: SupabaseBrowserClient | undefined;

/**
 * מחזיר מופע יחיד של לקוח Supabase לדפדפן (Client Components בלבד).
 * משתמש ב-@supabase/ssr לסנכרון עוגיות עם השרת וה-middleware.
 */
export function getSupabaseBrowserClient(): SupabaseBrowserClient {
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseBrowserClient() ניתן לקריאה רק בדפדפן — השתמש ב-Client Component.",
    );
  }

  if (!browserClient) {
    const { url, anonKey } = getSupabasePublicEnv();
    browserClient = createBrowserClient<Database>(url, anonKey);
  }

  return browserClient;
}
