import type { AuthProfile } from "@/lib/auth/session";

/** נתיב לאחר התחברות לפי סטטוס אישור */
export function getPostAuthPath(
  profile: AuthProfile | null,
  fallback = "/dashboard",
): string {
  if (!profile) {
    return fallback;
  }

  if (profile.role === "instructor" && profile.approval_status === "pending") {
    return "/pending-approval";
  }

  if (profile.role === "instructor" && profile.approval_status === "rejected") {
    return "/account-rejected";
  }

  return fallback;
}
