import type { AdminReportFilters } from "@/lib/admin-reports/types";

export type AdminReportKind = "instructor" | "institution" | "supplier" | "general";

export function resolveAdminReportKind(filters: AdminReportFilters): AdminReportKind {
  if (filters.instructorId) {
    return "instructor";
  }

  if (filters.institutionId) {
    return "institution";
  }

  if (filters.supplierId) {
    return "supplier";
  }

  return "general";
}

export function getAdminReportTitle(kind: AdminReportKind): string {
  switch (kind) {
    case "instructor":
      return "דוח שכר מדריך";
    case "institution":
      return "דוח מוסד";
    case "supplier":
      return "דוח ספק";
    default:
      return "דוח כספי ותפעולי";
  }
}
