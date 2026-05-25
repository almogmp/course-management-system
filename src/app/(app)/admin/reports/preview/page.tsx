import { Suspense } from "react";

import { AdminReportsPreviewToolbar } from "@/components/admin-reports/admin-reports-preview-toolbar";
import { AdminReportsPrintDocument } from "@/components/admin-reports/admin-reports-print-document";
import { Container } from "@/components/ui/container";
import {
  buildAdminFinancialReport,
  getAdminReportFilterOptions,
} from "@/lib/admin-reports/build-report";
import type { AdminReportSearchParams } from "@/lib/admin-reports/filters";
import {
  buildAdminReportQuery,
  parseAdminReportFilters,
} from "@/lib/admin-reports/search-params";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type AdminReportsPreviewPageProps = {
  searchParams?: AdminReportSearchParams;
};

export default async function AdminReportsPreviewPage({
  searchParams,
}: AdminReportsPreviewPageProps) {
  await requireAdmin();

  const filters = parseAdminReportFilters(searchParams ?? {});
  const filterOptions = await getAdminReportFilterOptions();
  const report = await buildAdminFinancialReport(filters, filterOptions);
  const backHref = `/admin/reports?${buildAdminReportQuery(filters)}`;

  const generatedAt = new Intl.DateTimeFormat("he-IL", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  return (
    <Container
      as="main"
      className="flex flex-1 flex-col gap-6 bg-background py-8 print:max-w-none print:py-4"
    >
      <Suspense fallback={null}>
        <AdminReportsPreviewToolbar report={report} backHref={backHref} />
      </Suspense>
      <AdminReportsPrintDocument report={report} generatedAt={generatedAt} />
    </Container>
  );
}
