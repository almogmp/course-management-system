"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { buildAdminReportCsv, downloadAdminReportCsv } from "@/lib/admin-reports/csv-export";
import {
  buildAdminReportQuery,
  parseAdminReportFiltersFromUrlSearchParams,
} from "@/lib/admin-reports/report-url";
import type { AdminReportData } from "@/lib/admin-reports/types";

type AdminReportsToolbarProps = {
  report: AdminReportData;
};

const buttonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function AdminReportsToolbar({ report }: AdminReportsToolbarProps) {
  const urlSearchParams = useSearchParams();

  const filtersFromUrl = useMemo(
    () => parseAdminReportFiltersFromUrlSearchParams(urlSearchParams),
    [urlSearchParams],
  );

  const query = buildAdminReportQuery(filtersFromUrl);
  const previewHref = `/admin/reports/preview?${query}`;
  const filtersMatchReport =
    buildAdminReportQuery(report.filters) === buildAdminReportQuery(filtersFromUrl);

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
        <Link href={previewHref} className={buttonClassName} prefetch={false}>
          הצג דוח
        </Link>
        <button type="button" className={buttonClassName} onClick={handleCsvExport}>
          ייצוא CSV
        </button>
      </div>
      {!filtersMatchReport ? (
        <p className="text-center text-xs text-amber-800">
          לחץ «החל סינון» לפני ייצוא — כתובת הדף לא תואמת את השדות בטופס.
        </p>
      ) : null}
      <p className="text-center text-xs text-muted-foreground">
        {report.rows.length} שורות
        {query ? ` · ${query}` : ""}
      </p>
    </div>
  );
}
