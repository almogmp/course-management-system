"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { buildReportPathUrl, type ReportSearchParams } from "@/lib/reports/report-url";
import type { PartnerReportDateRange } from "@/lib/reports/partner-report-types";
import type { PartnerReportFilterOptions } from "@/lib/reports/partner-report-types";

type ReportsFiltersProps = {
  dateRange: PartnerReportDateRange;
  searchParams?: ReportSearchParams;
  filterOptions: PartnerReportFilterOptions;
  basePath?: "/reports" | "/reports/audit";
};

const selectClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

const navButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function ReportsFilters({
  dateRange,
  searchParams,
  filterOptions,
  basePath = "/reports",
}: ReportsFiltersProps) {
  const router = useRouter();

  function updateFilter(key: "filterInstructor" | "filterInstitution", value: string) {
    const next: ReportSearchParams = {
      from: dateRange.from,
      to: dateRange.to,
      filterInstructor: searchParams?.filterInstructor,
      filterInstitution: searchParams?.filterInstitution,
    };

    if (value) {
      next[key] = value;
    } else {
      delete next[key];
    }

    router.push(buildReportPathUrl(basePath, dateRange, next));
  }

  const clearHref = buildReportPathUrl(basePath, dateRange);

  return (
    <section
      aria-label="סינון דוח"
      className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden"
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

      <div className="flex items-end">
        <Link href={clearHref} className={`${navButtonClassName} w-full sm:w-auto`}>
          ניקוי סינון
        </Link>
      </div>
    </section>
  );
}
