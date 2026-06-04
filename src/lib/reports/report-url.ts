import type { PartnerReportDateRange } from "@/lib/reports/partner-report-types";

export type ReportSearchParams = {
  from?: string;
  to?: string;
  filterInstructor?: string;
  filterInstitution?: string;
};

export function buildReportsUrl(
  dateRange: PartnerReportDateRange,
  searchParams?: ReportSearchParams,
): string {
  const params = new URLSearchParams();
  params.set("from", dateRange.from);
  params.set("to", dateRange.to);

  if (searchParams?.filterInstructor) {
    params.set("filterInstructor", searchParams.filterInstructor);
  }

  if (searchParams?.filterInstitution) {
    params.set("filterInstitution", searchParams.filterInstitution);
  }

  return `/reports?${params.toString()}`;
}
