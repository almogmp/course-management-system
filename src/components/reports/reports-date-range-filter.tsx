"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { buildReportsUrl, type ReportSearchParams } from "@/lib/reports/report-url";
import type { PartnerReportDateRange } from "@/lib/reports/partner-report-types";

type ReportsDateRangeFilterProps = {
  dateRange: PartnerReportDateRange;
  searchParams?: ReportSearchParams;
};

const inputClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

const buttonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90";

export function ReportsDateRangeFilter({
  dateRange,
  searchParams,
}: ReportsDateRangeFilterProps) {
  const router = useRouter();
  const [from, setFrom] = useState(dateRange.from);
  const [to, setTo] = useState(dateRange.to);

  function applyRange() {
    router.push(
      buildReportsUrl(
        { from, to },
        {
          filterInstructor: searchParams?.filterInstructor,
          filterInstitution: searchParams?.filterInstitution,
        },
      ),
    );
  }

  return (
    <section
      aria-label="טווח תאריכים"
      className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4 print:hidden"
    >
      <label className="min-w-[10rem] flex-1 space-y-1 text-start">
        <span className="text-xs font-medium text-muted-foreground">מתאריך</span>
        <input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className={inputClassName}
        />
      </label>
      <label className="min-w-[10rem] flex-1 space-y-1 text-start">
        <span className="text-xs font-medium text-muted-foreground">עד תאריך</span>
        <input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className={inputClassName}
        />
      </label>
      <button type="button" className={buttonClassName} onClick={applyRange}>
        הצג דוח
      </button>
    </section>
  );
}
