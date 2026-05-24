import { redirect } from "next/navigation";

import { getAuthSnapshot } from "@/lib/auth/session";

/** דורש משתמש מחובר ומאושר */
export async function requireAuth() {
  const { user, profile } = await getAuthSnapshot();

  if (!user) {
    redirect("/login");
  }

  if (profile?.role === "instructor" && profile.approval_status === "pending") {
    redirect("/pending-approval");
  }

  if (profile?.role === "instructor" && profile.approval_status === "rejected") {
    redirect("/account-rejected");
  }

  return { user, profile };
}

/** דורש מנהל מחובר — אחרת הפניה */
export async function requireAdmin() {
  const { user, isAdmin, profile } = await getAuthSnapshot();

  if (!user) {
    redirect("/login?next=/admin/instructor-approvals");
  }

  if (profile?.role === "instructor" && profile.approval_status === "pending") {
    redirect("/pending-approval");
  }

  if (profile?.role === "instructor" && profile.approval_status === "rejected") {
    redirect("/account-rejected");
  }

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return { user, profile };
}