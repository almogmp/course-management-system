import { redirect } from "next/navigation";

import type { AdminReportSearchParamsInput } from "@/lib/admin-reports/search-params";
import { buildReportsUrlFromAdminSearchParams } from "@/lib/reports/admin-reports-redirect";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type AdminReportsPageProps = {
  searchParams?: AdminReportSearchParamsInput;
};

/** Partner financial report lives at /reports (completed sessions, session-level rates). */
export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  await requireAdmin();
  redirect(buildReportsUrlFromAdminSearchParams(searchParams));
}
