import { formatReportDateRangeLabel } from "@/lib/admin-reports/default-date-range";
import {
  applyAdminReportFilters,
  getAdminReportStatusLabel,
  sessionMatchesScope,
} from "@/lib/admin-reports/filters";
import { getAdminReportSessionRows } from "@/lib/admin-reports/get-report-sessions";
import type {
  AdminReportData,
  AdminReportFilterOptions,
  AdminReportFilters,
  AdminReportSummary,
} from "@/lib/admin-reports/types";
import { countsAsCancelledFinancial, countsAsDeferredFinancial } from "@/lib/financial/status";

function buildSummary(
  rows: AdminReportData["rows"],
  scopeRows: AdminReportData["rows"],
  filters: AdminReportFilters,
): AdminReportSummary {
  const includeCancelledInFinancials = filters.status === "cancelled";

  let totalRevenue = 0;
  let totalInstructorPayout = 0;
  let totalProfit = 0;
  let instructorHours = 0;
  let companyHours = 0;

  for (const row of rows) {
    instructorHours += row.instructorHours;
    companyHours += row.companyHours;

    if (countsAsCancelledFinancial(row.status) && !includeCancelledInFinancials) {
      continue;
    }

    totalRevenue += row.revenue;
    totalInstructorPayout += row.instructorPayout;
    totalProfit += row.profit;
  }

  const cancelledCount = scopeRows.filter((row) => countsAsCancelledFinancial(row.status)).length;
  const deferredCount = scopeRows.filter((row) => countsAsDeferredFinancial(row.status)).length;

  return {
    totalSessions: rows.length,
    instructorHours,
    companyHours,
    totalRevenue,
    totalInstructorPayout,
    totalProfit,
    cancelledCount,
    deferredCount,
  };
}

function resolveFilterLabel(
  id: string | undefined,
  options: Array<{ id: string; name?: string; full_name?: string }>,
  allLabel: string,
): string {
  if (!id) {
    return allLabel;
  }

  const match = options.find((option) => option.id === id);
  return match?.name ?? match?.full_name ?? allLabel;
}

export async function buildAdminFinancialReport(
  filters: AdminReportFilters,
  filterOptions: AdminReportFilterOptions,
): Promise<AdminReportData> {
  const allRows = await getAdminReportSessionRows(filters.fromDate, filters.toDate);
  const scopeRows = allRows.filter((row) => sessionMatchesScope(row, filters));
  const rows = applyAdminReportFilters(allRows, filters);

  return {
    filters,
    rows,
    summary: buildSummary(rows, scopeRows, filters),
    filterLabels: {
      supplierName: resolveFilterLabel(filters.supplierId, filterOptions.suppliers, "כל הספקים"),
      institutionName: resolveFilterLabel(
        filters.institutionId,
        filterOptions.institutions,
        "כל המוסדות",
      ),
      instructorName: resolveFilterLabel(
        filters.instructorId,
        filterOptions.instructors,
        "כל המדריכים",
      ),
      statusLabel: getAdminReportStatusLabel(filters.status),
      dateRangeLabel: formatReportDateRangeLabel(filters.fromDate, filters.toDate),
    },
  };
}

export async function getAdminReportFilterOptions(): Promise<AdminReportFilterOptions> {
  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = await createServerSupabaseClient();

  const [{ data: suppliers }, { data: institutions }, { data: instructors }] = await Promise.all([
    supabase.from("primary_suppliers").select("id, name").eq("is_active", true).order("name"),
    supabase.from("institutions").select("id, name").eq("is_active", true).order("name"),
    supabase.from("instructors").select("id, full_name").order("full_name"),
  ]);

  return {
    suppliers: suppliers ?? [],
    institutions: institutions ?? [],
    instructors: instructors ?? [],
  };
}
