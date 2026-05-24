"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  formatMonthParam,
  type MonthView,
} from "@/components/calendar/month-calendar-utils";
import { ADMIN_STATUS_OPTIONS, SESSION_STATUS_LABELS } from "@/components/sessions/constants";
import { buildReportsUrl, type ReportSearchParams } from "@/lib/reports/report-url";
import type { ReportFilterOptions } from "@/lib/reports/types";

type ReportsFiltersProps = {
  monthView: MonthView;
  searchParams?: ReportSearchParams;
  filterOptions: ReportFilterOptions;
};

const selectClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

const navButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function ReportsFilters({
  monthView,
  searchParams,
  filterOptions,
}: ReportsFiltersProps) {
  const router = useRouter();

  function updateFilter(key: keyof ReportSearchParams, value: string) {
    const next: ReportSearchParams = {
      ...searchParams,
      month: formatMonthParam(monthView),
    };

    if (value) {
      next[key] = value;
    } else {
      delete next[key];
    }

    router.push(buildReportsUrl(monthView, next));
  }

  const clearHref = buildReportsUrl(monthView, { month: formatMonthParam(monthView) });

  return (
    <section
      aria-label="סינון דוח"
      className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden"
    >
      <label className="space-y-1 text-start">
        <span className="text-xs font-medium text-muted-foreground">מדריך</span>
        <select
          value={searchParams?.filterInstructor ?? ""}
          onChange={(event) => updateFilter("filterInstructor", event.target.value)}
          className={selectClassName}
        >
          <option value="">הכל</option>
          {filterOptions.instructors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-start">
        <span className="text-xs font-medium text-muted-foreground">מוסד</span>
        <select
          value={searchParams?.filterInstitution ?? ""}
          onChange={(event) => updateFilter("filterInstitution", event.target.value)}
          className={selectClassName}
        >
          <option value="">הכל</option>
          {filterOptions.institutions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-start">
        <span className="text-xs font-medium text-muted-foreground">סטטוס מפגש</span>
        <select
          value={searchParams?.filterStatus ?? ""}
          onChange={(event) => updateFilter("filterStatus", event.target.value)}
          className={selectClassName}
        >
          <option value="">הכל</option>
          {ADMIN_STATUS_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {SESSION_STATUS_LABELS[item.value]}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end sm:col-span-2 lg:col-span-1">
        <Link href={clearHref} className={`${navButtonClassName} w-full sm:w-auto`}>
          ניקוי סינון
        </Link>
      </div>
    </section>
  );
}
