import Link from "next/link";

import { ReportsDateRangeFilter } from "@/components/reports/reports-date-range-filter";
import { ReportsFilters } from "@/components/reports/reports-filters";
import { ReportsFinancialAuditTable } from "@/components/reports/reports-financial-audit-table";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/guards";
import { buildFinancialAuditReport } from "@/lib/reports/build-financial-audit-report";
import {
  getPartnerReportFilterOptions,
  getPartnerReportSessions,
} from "@/lib/reports/get-partner-report-sessions";
import { formatReportRangeLabel, parseReportDateRange } from "@/lib/reports/report-date-range";
import { buildFinancialAuditUrl, buildReportsUrl } from "@/lib/reports/report-url";
import type { ReportSearchParams } from "@/lib/reports/report-url";

type FinancialAuditPageProps = {
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

export default async function FinancialAuditPage({ searchParams }: FinancialAuditPageProps) {
  await requireAdmin();

  const dateRange = parseReportDateRange(searchParams?.from, searchParams?.to);
  const rangeLabel = formatReportRangeLabel(dateRange);

  const [filterOptions, sessions] = await Promise.all([
    getPartnerReportFilterOptions(),
    getPartnerReportSessions(dateRange.from, dateRange.to),
  ]);

  const filteredSessions = filterSessions(sessions, searchParams);
  const audit = buildFinancialAuditReport(dateRange, filteredSessions);

  const problemCount = audit.rows.filter(
    (row) =>
      (row.companyHours > 0 && row.missingCompanyRate) ||
      (row.instructorHours > 0 && row.missingInstructorRate),
  ).length;

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-start">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/dashboard"
            className="text-primary underline-offset-4 hover:underline"
          >
            חזרה לדשבורד
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link
            href={buildReportsUrl(dateRange, searchParams)}
            className="text-primary underline-offset-4 hover:underline"
          >
            דוחות כספיים
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">אבחון חישובים כספיים</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          תצוגת ביקורת ברמת מפגש — מפגשים שבוצעו בלבד · {rangeLabel} · {audit.rows.length}{" "}
          מפגשים
        </p>
        <p className="text-xs text-muted-foreground">
          כלי אבחון לבדיקת תעריפים וחישובים. לא מיועד לשימוש יומיומי.
        </p>
      </header>

      <ReportsDateRangeFilter
        dateRange={dateRange}
        searchParams={searchParams}
        basePath="/reports/audit"
        submitLabel="הצג אבחון"
      />

      <ReportsFilters
        dateRange={dateRange}
        searchParams={searchParams}
        filterOptions={filterOptions}
        basePath="/reports/audit"
      />

      {problemCount > 0 ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {problemCount} מפגשים עם שעות אך ללא תעריף במקור הצפוי — מסומנים בטבלה.
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">פירוט לפי מפגש</h2>
        <p className="text-sm text-muted-foreground">
          תקבול ברוטו = שעות חברה × תעריף חברה · עלות מדריך = שעות מדריך × תעריף מדריך · מע״מ =
          ברוטו − (ברוטו / 1.18) · רווח גולמי = ברוטו − מע״מ − עלות מדריך
        </p>
        <ReportsFinancialAuditTable rows={audit.rows} />
      </section>

      <p className="text-xs text-muted-foreground">
        <Link
          href={buildFinancialAuditUrl(dateRange, searchParams)}
          className="underline-offset-4 hover:underline"
        >
          קישור ישיר לאבחון זה
        </Link>
      </p>
    </Container>
  );
}
