import type { AdminReportSearchParamsInput } from "@/lib/admin-reports/search-params";
import { parseAdminReportFilters } from "@/lib/admin-reports/search-params";
import { buildReportsUrl } from "@/lib/reports/report-url";

/** Map legacy /admin/reports query params to /reports partner report params. */
export function buildReportsUrlFromAdminSearchParams(
  searchParams?: AdminReportSearchParamsInput | null,
): string {
  const filters = parseAdminReportFilters(searchParams);

  return buildReportsUrl(
    { from: filters.fromDate, to: filters.toDate },
    {
      from: filters.fromDate,
      to: filters.toDate,
      filterInstructor: filters.instructorId,
      filterInstitution: filters.institutionId,
    },
  );
}
