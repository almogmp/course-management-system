import type { AdminReportFilters } from "@/lib/admin-reports/types";

export function buildAdminReportQuery(filters: AdminReportFilters): string {
  const params = new URLSearchParams();
  params.set("from", filters.fromDate);
  params.set("to", filters.toDate);
  params.set("status", filters.status);

  if (filters.supplierId) {
    params.set("supplier", filters.supplierId);
  }

  if (filters.institutionId) {
    params.set("institution", filters.institutionId);
  }

  if (filters.instructorId) {
    params.set("instructor", filters.instructorId);
  }

  return params.toString();
}
