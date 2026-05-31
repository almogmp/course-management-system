import "server-only";

import { getAuthSnapshot } from "@/lib/auth/session";

export type AuthForActionResult =
  | {
      ok: true;
      userId: string;
      email: string | undefined;
      isAdmin: boolean;
    }
  | { ok: false; error: string };

/**
 * Auth gate for server actions invoked from client components.
 * Never redirects — returns an error object the client can display.
 */
export async function requireAuthForAction(): Promise<AuthForActionResult> {
  const { user, profile, isAdmin } = await getAuthSnapshot();

  if (!user) {
    return { ok: false, error: "יש להתחבר מחדש." };
  }

  if (profile?.role === "instructor" && profile.approval_status === "pending") {
    return { ok: false, error: "החשבון ממתין לאישור." };
  }

  if (profile?.role === "instructor" && profile.approval_status === "rejected") {
    return { ok: false, error: "החשבון נדחה." };
  }

  return {
    ok: true,
    userId: user.id,
    email: user.email,
    isAdmin,
  };
}
