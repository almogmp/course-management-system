import { getDefaultAdminReportDateRange } from "@/lib/admin-reports/default-date-range";
import { ADMIN_REPORT_STATUS_OPTIONS } from "@/lib/admin-reports/filters";
import type { AdminReportFilters, AdminReportStatusFilter } from "@/lib/admin-reports/types";
import { toLocalDateKey } from "@/lib/date/week";

/** Next.js may pass string or string[] for query keys. */
export function normalizeSearchParam(
  value: string | string[] | null | undefined,
): string | undefined {
  if (value == null) {
    return undefined;
  }

  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export type AdminReportSearchParamsInput = {
  from?: string | string[];
  to?: string | string[];
  supplier?: string | string[];
  institution?: string | string[];
  instructor?: string | string[];
  status?: string | string[];
  month?: string | string[];
};

export function parseAdminReportFilters(
  searchParams?: AdminReportSearchParamsInput | null,
): AdminReportFilters {
  const defaults = getDefaultAdminReportDateRange();
  const statusRaw = normalizeSearchParam(searchParams?.status) ?? "all";
  const validStatus = ADMIN_REPORT_STATUS_OPTIONS.some((option) => option.value === statusRaw)
    ? (statusRaw as AdminReportStatusFilter)
    : "all";

  const month = normalizeSearchParam(searchParams?.month);
  let fromDate = normalizeSearchParam(searchParams?.from) ?? defaults.fromDate;
  let toDate = normalizeSearchParam(searchParams?.to) ?? defaults.toDate;

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, monthNum] = month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0);
    fromDate = toLocalDateKey(start);
    toDate = toLocalDateKey(end);
  }

  return {
    fromDate,
    toDate,
    supplierId: normalizeSearchParam(searchParams?.supplier),
    institutionId: normalizeSearchParam(searchParams?.institution),
    instructorId: normalizeSearchParam(searchParams?.instructor),
    status: validStatus,
  };
}

export function parseAdminReportFiltersFromUrlSearchParams(
  params: Pick<URLSearchParams, "get">,
): AdminReportFilters {
  return parseAdminReportFilters({
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
    supplier: params.get("supplier") ?? undefined,
    institution: params.get("institution") ?? undefined,
    instructor: params.get("instructor") ?? undefined,
    status: params.get("status") ?? undefined,
    month: params.get("month") ?? undefined,
  });
}

export function buildAdminReportQuery(filters: AdminReportFilters, month?: string): string {
  const params = new URLSearchParams();
  params.set("from", filters.fromDate);
  params.set("to", filters.toDate);
  params.set("status", filters.status);

  if (month) {
    params.set("month", month);
  }

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

export function adminReportFiltersQueryKey(filters: AdminReportFilters): string {
  return buildAdminReportQuery(filters);
}
