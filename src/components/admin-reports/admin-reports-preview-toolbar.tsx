"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { buildAdminReportCsv, downloadAdminReportCsv } from "@/lib/admin-reports/csv-export";
import {
  buildAdminReportQuery,
  parseAdminReportFiltersFromUrlSearchParams,
} from "@/lib/admin-reports/report-url";
import type { AdminReportData } from "@/lib/admin-reports/types";

type AdminReportsPreviewToolbarProps = {
  report: AdminReportData;
  backHref: string;
};

const buttonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function AdminReportsPreviewToolbar({ report, backHref }: AdminReportsPreviewToolbarProps) {
  const urlSearchParams = useSearchParams();
  const filtersFromUrl = useMemo(
    () => parseAdminReportFiltersFromUrlSearchParams(urlSearchParams),
    [urlSearchParams],
  );
  const queryKey = buildAdminReportQuery(filtersFromUrl);
  const filtersMatchReport = buildAdminReportQuery(report.filters) === queryKey;

  function handleCsvExport() {
    const content = buildAdminReportCsv(report);
    downloadAdminReportCsv(
      `financial-report-${filtersFromUrl.fromDate}-${filtersFromUrl.toDate}.csv`,
      content,
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 print-hidden">
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className={buttonClassName} onClick={() => window.print()}>
          הדפס / שמור כ-PDF
        </button>
        <button type="button" className={buttonClassName} onClick={handleCsvExport}>
          ייצוא CSV
        </button>
        <Link href={backHref} className={buttonClassName}>
          חזרה לדוחות
        </Link>
      </div>
      <p
        className={`text-center text-xs ${filtersMatchReport ? "text-muted-foreground" : "text-amber-800"}`}
        data-report-row-count={report.rows.length}
        data-filter-query={queryKey}
      >
        {report.rows.length} שורות בדוח
        {filtersMatchReport ? " — תואם לסינון בכתובת" : " — אזהרה: סינון בכתובת לא תואם לנתוני הדוח"}
      </p>
    </div>
  );
}
