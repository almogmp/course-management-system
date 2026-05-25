import Link from "next/link";
import { Suspense } from "react";

import { AdminReportsFilters } from "@/components/admin-reports/admin-reports-filters";
import { AdminReportsSummaryCards } from "@/components/admin-reports/admin-reports-summary-cards";
import { AdminReportsTable } from "@/components/admin-reports/admin-reports-table";
import { AdminReportsToolbar } from "@/components/admin-reports/admin-reports-toolbar";
import { Container } from "@/components/ui/container";
import {
  buildAdminFinancialReport,
  getAdminReportFilterOptions,
} from "@/lib/admin-reports/build-report";
import type { AdminReportSearchParams } from "@/lib/admin-reports/filters";
import { parseAdminReportFilters } from "@/lib/admin-reports/search-params";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type AdminReportsPageProps = {
  searchParams?: AdminReportSearchParams;
};

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  await requireAdmin();

  const filters = parseAdminReportFilters(searchParams ?? {});
  const filterOptions = await getAdminReportFilterOptions();
  const report = await buildAdminFinancialReport(filters, filterOptions);

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8 print:py-4">
      <header className="space-y-2 text-start print-hidden">
        <Link
          href="/dashboard"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          חזרה לדשבורד
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          דוחות כספיים ותפעוליים
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          דוח לפי טווח תאריכים, ספק, מוסד, מדריך וסטטוס
        </p>
      </header>

      <div className="print-hidden">
        <AdminReportsFilters
          filters={filters}
          options={filterOptions}
          rowCount={report.rows.length}
        />
      </div>

      <Suspense fallback={null}>
        <AdminReportsToolbar report={report} />
      </Suspense>

      <div id="admin-reports-print-area" className="space-y-6">
        <AdminReportsSummaryCards report={report} />
        <AdminReportsTable report={report} />
      </div>
    </Container>
  );
}
