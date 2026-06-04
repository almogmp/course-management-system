import { redirect } from "next/navigation";

import type { AdminReportSearchParamsInput } from "@/lib/admin-reports/search-params";
import { buildReportsUrlFromAdminSearchParams } from "@/lib/reports/admin-reports-redirect";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type AdminReportsPreviewPageProps = {
  searchParams?: AdminReportSearchParamsInput;
};

export default async function AdminReportsPreviewPage({
  searchParams,
}: AdminReportsPreviewPageProps) {
  await requireAdmin();
  redirect(buildReportsUrlFromAdminSearchParams(searchParams));
}
