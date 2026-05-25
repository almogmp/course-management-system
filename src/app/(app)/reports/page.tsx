import Link from "next/link";

import { parseMonthParam, formatMonthLabel, formatMonthParam } from "@/components/calendar/month-calendar-utils";
import { ReportsCourseTable } from "@/components/reports/reports-course-table";
import { ReportsExportToolbar } from "@/components/reports/reports-export-toolbar";
import { ReportsFilters } from "@/components/reports/reports-filters";
import { ReportsInstitutionTable } from "@/components/reports/reports-institution-table";
import { ReportsInstructorTable } from "@/components/reports/reports-instructor-table";
import { ReportsMonthSelector } from "@/components/reports/reports-month-selector";
import { ReportsFinancialSummaryCards } from "@/components/reports/reports-financial-summary-cards";
import { ReportsSummaryCards } from "@/components/reports/reports-summary-cards";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/guards";
import { buildMonthlyReportDataFromFinancial } from "@/lib/reports/build-financial-report";
import { applyReportFilters, parseReportFilters } from "@/lib/reports/report-filters";
import type { ReportSearchParams } from "@/lib/reports/report-url";
import { getFinancialSessionsForMonth } from "@/lib/financial/get-financial-sessions";
import { getMonthlyReportSessions } from "@/lib/reports/get-monthly-report-data";

type ReportsPageProps = {
  searchParams?: ReportSearchParams;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requireAdmin();

  const monthView = parseMonthParam(searchParams?.month);
  const monthLabel = formatMonthLabel(monthView);
  const monthParam = formatMonthParam(monthView);
  const filters = parseReportFilters(searchParams);

  const [{ filterOptions }, financialRecords] = await Promise.all([
    getMonthlyReportSessions(monthView),
    getFinancialSessionsForMonth(monthView),
  ]);

  const filterableSessions = financialRecords.map((record) => ({
    id: record.id,
    status: record.status,
    instructor_hours: record.instructor_hours,
    company_hours: record.company_hours,
    instructor_id: record.instructor_id,
    instructor_name: record.instructor_name,
    institution_id: record.institution_id,
    institution_name: record.institution_name,
    course_id: record.course_id,
    course_name: record.course_name,
    course_status: "active" as const,
  }));

  const filteredIds = new Set(
    applyReportFilters(filterableSessions, filters).map((session) => session.id),
  );
  const filteredFinancialRecords = financialRecords.filter((record) =>
    filteredIds.has(record.id),
  );

  const report = buildMonthlyReportDataFromFinancial(filteredFinancialRecords);

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8 print:py-4">
      <header className="space-y-2 text-start print:hidden">
        <Link
          href="/dashboard"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          חזרה לדשבורד
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">דוחות</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          סקירה חודשית של פעילות המפגשים — {monthLabel}
        </p>
      </header>

      <div className="hidden print:block print:mb-4 print:text-start">
        <h1 className="text-xl font-bold text-foreground">דוח חודשי — {monthLabel}</h1>
      </div>

      <ReportsMonthSelector monthView={monthView} searchParams={searchParams} />

      <ReportsFilters
        monthView={monthView}
        searchParams={searchParams}
        filterOptions={filterOptions}
      />

      <ReportsExportToolbar report={report} monthLabel={monthLabel} monthParam={monthParam} />

      <div id="reports-print-area" className="space-y-8 print:space-y-6">
        <ReportsSummaryCards summary={report.summary} />
        <ReportsFinancialSummaryCards financial={report.summary.financial} />
        <ReportsInstructorTable rows={report.instructorRows} />
        <ReportsInstitutionTable rows={report.institutionRows} />
        <ReportsCourseTable rows={report.courseRows} />
      </div>
    </Container>
  );
}
