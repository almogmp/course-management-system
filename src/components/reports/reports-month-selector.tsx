import Link from "next/link";

import {
  formatMonthLabel,
  type MonthView,
} from "@/components/calendar/month-calendar-utils";
import {
  buildReportsMonthNavUrls,
  type ReportSearchParams,
} from "@/lib/reports/report-url";

type ReportsMonthSelectorProps = {
  monthView: MonthView;
  searchParams?: ReportSearchParams;
};

const navButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function ReportsMonthSelector({
  monthView,
  searchParams,
}: ReportsMonthSelectorProps) {
  const { previousHref, nextHref } = buildReportsMonthNavUrls(monthView, searchParams);
  const monthLabel = formatMonthLabel(monthView);

  return (
    <nav
      aria-label="בחירת חודש לדוח"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 print:border-0 print:p-0"
    >
      <Link href={previousHref} className={`${navButtonClassName} print:hidden`}>
        חודש קודם
      </Link>
      <p className="min-w-36 px-2 text-center text-base font-semibold text-foreground sm:text-lg">
        {monthLabel}
      </p>
      <Link href={nextHref} className={`${navButtonClassName} print:hidden`}>
        חודש הבא
      </Link>
    </nav>
  );
}
