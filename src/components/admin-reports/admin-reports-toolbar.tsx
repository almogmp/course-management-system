"use client";

import Link from "next/link";

import { buildAdminReportCsv, downloadAdminReportCsv } from "@/lib/admin-reports/csv-export";
import { buildAdminReportQuery } from "@/lib/admin-reports/report-url";
import type { AdminReportData } from "@/lib/admin-reports/types";

type AdminReportsToolbarProps = {
  report: AdminReportData;
};

const buttonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function AdminReportsToolbar({ report }: AdminReportsToolbarProps) {
  const query = buildAdminReportQuery(report.filters);
  const previewHref = `/admin/reports/preview?${query}`;

  function handleCsvExport() {
    const content = buildAdminReportCsv(report);
    downloadAdminReportCsv(
      `financial-report-${report.filters.fromDate}-${report.filters.toDate}.csv`,
      content,
    );
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 print-hidden">
      <Link href={previewHref} className={buttonClassName}>
        הצג דוח
      </Link>
      <Link href={`${previewHref}&print=1`} className={buttonClassName}>
        הורד PDF
      </Link>
      <button type="button" className={buttonClassName} onClick={handlePrint}>
        הדפס דוח
      </button>
      <button type="button" className={buttonClassName} onClick={handleCsvExport}>
        ייצוא CSV
      </button>
    </div>
  );
}
