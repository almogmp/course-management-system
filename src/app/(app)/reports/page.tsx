import Link from "next/link";

import { ReportsDateRangeFilter } from "@/components/reports/reports-date-range-filter";
import { ReportsExportToolbar } from "@/components/reports/reports-export-toolbar";
import { ReportsFilters } from "@/components/reports/reports-filters";
import { ReportsFinancialSummaryCards } from "@/components/reports/reports-financial-summary-cards";
import { ReportsInstitutionTable } from "@/components/reports/reports-institution-table";
import { ReportsInstructorTable } from "@/components/reports/reports-instructor-table";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/guards";
import { buildPartnerFinancialReport } from "@/lib/reports/build-partner-financial-report";
import {
  getPartnerReportFilterOptions,
  getPartnerReportSessions,
} from "@/lib/reports/get-partner-report-sessions";
import { formatReportRangeLabel, parseReportDateRange } from "@/lib/reports/report-date-range";
import type { ReportSearchParams } from "@/lib/reports/report-url";

type ReportsPageProps = {
  searchParams?: ReportSearchParams;
};

function filterSessions(
  sessions: Awaited<ReturnType<typeof getPartnerReportSessions>>,
  searchParams?: ReportSearchParams,
) {
  let filtered = sessions;

  if (searchParams?.filterInstructor) {
    filtered = filtered.filter((s) => s.instructor_id === searchParams.filterInstructor);
  }

  if (searchParams?.filterInstitution) {
    filtered = filtered.filter((s) => s.institution_id === searchParams.filterInstitution);
  }

  return filtered;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requireAdmin();

  const dateRange = parseReportDateRange(searchParams?.from, searchParams?.to);
  const rangeLabel = formatReportRangeLabel(dateRange);

  const [filterOptions, sessions] = await Promise.all([
    getPartnerReportFilterOptions(),
    getPartnerReportSessions(dateRange.from, dateRange.to),
  ]);

  const filteredSessions = filterSessions(sessions, searchParams);
  const report = buildPartnerFinancialReport(dateRange, filteredSessions);

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8 print:py-4">
      <header className="space-y-2 text-start print:hidden">
        <Link
          href="/dashboard"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          חזרה לדשבורד
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">דוחות כספיים</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          דוח רווח לפי טווח תאריכים — מפגשים שבוצעו בלבד · {rangeLabel}
        </p>
      </header>

      <div className="hidden print:block print:mb-4 print:text-start">
        <h1 className="text-xl font-bold text-foreground">דוח כספי — {rangeLabel}</h1>
        <p className="text-sm text-muted-foreground">מפגשים שבוצעו בלבד</p>
      </div>

      <ReportsDateRangeFilter dateRange={dateRange} searchParams={searchParams} />

      <ReportsFilters
        dateRange={dateRange}
        searchParams={searchParams}
        filterOptions={filterOptions}
      />

      <ReportsExportToolbar report={report} rangeLabel={rangeLabel} />

      <div id="reports-print-area" className="space-y-8 print:space-y-6">
        <ReportsFinancialSummaryCards report={report} />
        <ReportsInstructorTable rows={report.instructorRows} />
        <ReportsInstitutionTable rows={report.institutionRows} />
      </div>
    </Container>
  );
}
