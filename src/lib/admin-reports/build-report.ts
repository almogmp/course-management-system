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

  let totalGrossRevenue = 0;
  let totalVat = 0;
  let totalNetRevenue = 0;
  let totalInstructorPayout = 0;
  let totalGrossProfit = 0;
  let totalNetProfit = 0;
  let instructorHours = 0;
  let companyHours = 0;

  for (const row of rows) {
    instructorHours += row.instructorHours;
    companyHours += row.companyHours;

    if (countsAsCancelledFinancial(row.status) && !includeCancelledInFinancials) {
      continue;
    }

    totalGrossRevenue += row.financials.grossRevenue;
    totalVat += row.financials.vatAmount;
    totalNetRevenue += row.financials.netRevenueBeforeInstructor;
    totalInstructorPayout += row.financials.instructorPayout;
    totalGrossProfit += row.financials.grossProfit;
    totalNetProfit += row.financials.netProfit;
  }

  const cancelledCount = scopeRows.filter((row) => countsAsCancelledFinancial(row.status)).length;
  const deferredCount = scopeRows.filter((row) => countsAsDeferredFinancial(row.status)).length;

  return {
    totalSessions: rows.length,
    instructorHours,
    companyHours,
    totalGrossRevenue,
    totalVat,
    totalNetRevenue,
    totalInstructorPayout,
    totalGrossProfit,
    totalNetProfit,
    cancelledCount,
    deferredCount,
  };
}

function resolveFilterLabel(
  id: string | undefined,
  options: Array<{ id: string; name?: string; full_name?: string }>,
  allLabel: string,
  fallbackName?: string,
): string {
  if (!id) {
    return allLabel;
  }

  const match = options.find((option) => option.id === id);
  if (match?.name) {
    return match.name;
  }

  if (match?.full_name) {
    return match.full_name;
  }

  if (fallbackName) {
    return fallbackName;
  }

  return allLabel;
}

function fallbackSupplierName(rows: AdminReportData["rows"], supplierId: string): string | undefined {
  return rows.find((row) => row.supplierId === supplierId)?.supplierName;
}

function fallbackInstitutionName(
  rows: AdminReportData["rows"],
  institutionId: string,
): string | undefined {
  return rows.find((row) => row.institutionId === institutionId)?.institutionName;
}

function fallbackInstructorName(
  rows: AdminReportData["rows"],
  instructorId: string,
): string | undefined {
  return rows.find((row) => row.instructorId === instructorId)?.instructorName;
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
      supplierName: resolveFilterLabel(
        filters.supplierId,
        filterOptions.suppliers,
        "כל הספקים",
        filters.supplierId ? fallbackSupplierName(rows, filters.supplierId) : undefined,
      ),
      institutionName: resolveFilterLabel(
        filters.institutionId,
        filterOptions.institutions,
        "כל המוסדות",
        filters.institutionId ? fallbackInstitutionName(rows, filters.institutionId) : undefined,
      ),
      instructorName: resolveFilterLabel(
        filters.instructorId,
        filterOptions.instructors,
        "כל המדריכים",
        filters.instructorId ? fallbackInstructorName(rows, filters.instructorId) : undefined,
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
