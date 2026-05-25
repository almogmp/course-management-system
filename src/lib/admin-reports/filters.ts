import {
  ACTIVE_OPERATIONAL_STATUSES,
  SESSION_STATUS_LABELS,
  type SessionStatus,
} from "@/components/sessions/constants";
import { getDefaultAdminReportDateRange } from "@/lib/admin-reports/default-date-range";
import type {
  AdminReportFilters,
  AdminReportSessionRow,
  AdminReportStatusFilter,
} from "@/lib/admin-reports/types";

export const ADMIN_REPORT_STATUS_OPTIONS: Array<{
  value: AdminReportStatusFilter;
  label: string;
}> = [
  { value: "all", label: "הכל" },
  { value: "completed", label: "בוצע" },
  { value: "planned", label: "מתוכנן" },
  { value: "active", label: "פעיל" },
  { value: "cancelled", label: "בוטל" },
  { value: "deferred", label: "נדחה" },
];

export type AdminReportSearchParams = {
  from?: string;
  to?: string;
  supplier?: string;
  institution?: string;
  instructor?: string;
  status?: string;
};

export function parseAdminReportFilters(
  searchParams?: AdminReportSearchParams,
): AdminReportFilters {
  const defaults = getDefaultAdminReportDateRange();
  const status = (searchParams?.status?.trim() || "all") as AdminReportStatusFilter;
  const validStatus = ADMIN_REPORT_STATUS_OPTIONS.some((option) => option.value === status)
    ? status
    : "all";

  return {
    fromDate: searchParams?.from?.trim() || defaults.fromDate,
    toDate: searchParams?.to?.trim() || defaults.toDate,
    supplierId: searchParams?.supplier?.trim() || undefined,
    institutionId: searchParams?.institution?.trim() || undefined,
    instructorId: searchParams?.instructor?.trim() || undefined,
    status: validStatus,
  };
}

function matchesStatusFilter(status: SessionStatus, filter: AdminReportStatusFilter): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "completed") {
    return status === "completed";
  }

  if (filter === "planned") {
    return status === "planned";
  }

  if (filter === "active") {
    return ACTIVE_OPERATIONAL_STATUSES.includes(status);
  }

  if (filter === "cancelled") {
    return status === "cancelled";
  }

  return status === "deferred";
}

export function applyAdminReportFilters(
  rows: AdminReportSessionRow[],
  filters: AdminReportFilters,
): AdminReportSessionRow[] {
  return rows.filter((row) => {
    if (filters.supplierId && row.supplierId !== filters.supplierId) {
      return false;
    }

    if (filters.institutionId && row.institutionId !== filters.institutionId) {
      return false;
    }

    if (filters.instructorId && row.instructorId !== filters.instructorId) {
      return false;
    }

    if (!matchesStatusFilter(row.status, filters.status)) {
      return false;
    }

    return true;
  });
}

export function getAdminReportStatusLabel(status: AdminReportStatusFilter): string {
  return ADMIN_REPORT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "הכל";
}

export function sessionMatchesScope(
  row: AdminReportSessionRow,
  filters: Pick<AdminReportFilters, "supplierId" | "institutionId" | "instructorId">,
): boolean {
  if (filters.supplierId && row.supplierId !== filters.supplierId) {
    return false;
  }

  if (filters.institutionId && row.institutionId !== filters.institutionId) {
    return false;
  }

  if (filters.instructorId && row.instructorId !== filters.instructorId) {
    return false;
  }

  return true;
}

export function formatSessionStatusLabel(status: SessionStatus): string {
  return SESSION_STATUS_LABELS[status] ?? status;
}
