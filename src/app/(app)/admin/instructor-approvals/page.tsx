import Link from "next/link";

import { InstructorApprovalActions } from "@/components/admin/instructor-approval-actions";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type PendingInstructor = {
  profileId: string;
  fullName: string;
  phone: string;
  email: string;
  createdAt: string;
};

async function getPendingInstructors(): Promise<PendingInstructor[]> {
  const supabase = await createServerSupabaseClient();

  const { data: pendingProfiles } = await supabase
    .from("profiles")
    .select("id, email, created_at")
    .eq("role", "instructor")
    .eq("approval_status", "pending")
    .order("created_at", { ascending: false });

  if (!pendingProfiles?.length) {
    return [];
  }

  const profileIds = pendingProfiles.map((p) => p.id);

  const { data: instructors } = await supabase
    .from("instructors")
    .select("user_id, full_name, phone, email, created_at")
    .in("user_id", profileIds);

  const instructorByUserId = new Map(
    (instructors ?? []).map((row) => [row.user_id, row]),
  );

  return pendingProfiles.map((profile) => {
    const instructor = instructorByUserId.get(profile.id);

    return {
      profileId: profile.id,
      fullName: instructor?.full_name ?? "—",
      phone: instructor?.phone ?? "—",
      email: instructor?.email ?? profile.email,
      createdAt: instructor?.created_at ?? profile.created_at,
    };
  });
}

export default async function InstructorApprovalsPage() {
  await requireAdmin();
  const pending = await getPendingInstructors();

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2">
        <Link
          href="/dashboard"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          חזרה לאזור המנהל
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          אישור בקשות מדריכים
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          בקשות הממתינות לאישור מנהל המערכת
        </p>
      </header>

      {pending.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-6 text-center text-muted-foreground">
          אין בקשות ממתינות כרגע.
        </p>
      ) : (
        <ul className="space-y-4">
          {pending.map((item) => (
            <li
              key={item.profileId}
              className="rounded-lg border border-border bg-surface p-4 sm:p-5"
            >
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {item.fullName}
                  </h2>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {item.email}
                  </p>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {item.phone}
                  </p>
                </div>
                <InstructorApprovalActions profileId={item.profileId} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
