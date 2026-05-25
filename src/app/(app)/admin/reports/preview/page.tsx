import { AdminReportsPreviewActions } from "@/components/admin-reports/admin-reports-preview-actions";
import { AdminReportsPrintDocument } from "@/components/admin-reports/admin-reports-print-document";
import { Container } from "@/components/ui/container";
import {
  buildAdminFinancialReport,
  getAdminReportFilterOptions,
} from "@/lib/admin-reports/build-report";
import { parseAdminReportFilters } from "@/lib/admin-reports/filters";
import type { AdminReportSearchParams } from "@/lib/admin-reports/filters";
import { buildAdminReportQuery } from "@/lib/admin-reports/report-url";
import { requireAdmin } from "@/lib/auth/guards";

type AdminReportsPreviewPageProps = {
  searchParams?: AdminReportSearchParams & { print?: string };
};

export default async function AdminReportsPreviewPage({
  searchParams,
}: AdminReportsPreviewPageProps) {
  await requireAdmin();

  const filters = parseAdminReportFilters(searchParams);
  const filterOptions = await getAdminReportFilterOptions();
  const report = await buildAdminFinancialReport(filters, filterOptions);
  const backHref = `/admin/reports?${buildAdminReportQuery(filters)}`;
  const autoPrint = searchParams?.print === "1";

  const generatedAt = new Intl.DateTimeFormat("he-IL", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8 print:py-4">
      <AdminReportsPreviewActions backHref={backHref} autoPrint={autoPrint} />
      <AdminReportsPrintDocument report={report} generatedAt={generatedAt} />
    </Container>
  );
}
