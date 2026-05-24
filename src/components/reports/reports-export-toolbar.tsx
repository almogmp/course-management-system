"use client";

import { buildMonthlyReportCsv, downloadCsvFile } from "@/lib/reports/csv-export";
import type { MonthlyReportData } from "@/lib/reports/types";

type ReportsExportToolbarProps = {
  report: MonthlyReportData;
  monthLabel: string;
  monthParam: string;
};

const buttonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60";

export function ReportsExportToolbar({
  report,
  monthLabel,
  monthParam,
}: ReportsExportToolbarProps) {
  function handleCsvExport() {
    const content = buildMonthlyReportCsv(report, monthLabel);
    downloadCsvFile(`report-${monthParam}.csv`, content);
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
