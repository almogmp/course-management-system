"use client";

import {
  buildPartnerReportCsv,
  downloadCsvFile,
} from "@/lib/reports/partner-csv-export";
import type { PartnerFinancialReport } from "@/lib/reports/partner-report-types";

type ReportsExportToolbarProps = {
  report: PartnerFinancialReport;
  rangeLabel: string;
};

const buttonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60";

export function ReportsExportToolbar({ report, rangeLabel }: ReportsExportToolbarProps) {
  function handleCsvExport() {
    const content = buildPartnerReportCsv(report, rangeLabel);
    const safeFrom = report.dateRange.from.replace(/-/g, "");
    const safeTo = report.dateRange.to.replace(/-/g, "");
    downloadCsvFile(`financial-report-${safeFrom}-${safeTo}.csv`, content);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button type="button" className={buttonClassName} onClick={handleCsvExport}>
        ייצוא CSV
      </button>
      <button type="button" className={buttonClassName} onClick={handlePrint}>
        הדפסה
      </button>
    </div>
  );
}
