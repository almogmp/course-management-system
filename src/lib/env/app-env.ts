/**
 * Centralized public environment configuration.
 * Only NEXT_PUBLIC_* vars belong here — never service role or other secrets.
 */

function readOptionalEnv(name: string, value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

/** Canonical app URL for metadata and OAuth redirects. Falls back safely in dev. */
export function getAppUrl(): string {
  const fromEnv = readOptionalEnv("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL);

  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[env] NEXT_PUBLIC_APP_URL is invalid (${fromEnv}). Using http://localhost:3000.`,
        );
      }
    }
  }

  return "http://localhost:3000";
}

/** Demo seed route — disabled in production unless explicitly enabled. */
export function isAdminSeedEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return process.env.ENABLE_ADMIN_SEED === "true";
}

export function getMissingPublicEnvNames(): string[] {
  const missing: string[] = [];

  if (!readOptionalEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!readOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return missing;
}
