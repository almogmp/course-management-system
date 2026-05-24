import Link from "next/link";

import {
  formatMonthLabel,
  type MonthView,
} from "@/components/calendar/month-calendar-utils";
import {
  buildDashboardMonthNavUrls,
  type DashboardSearchParams,
} from "@/lib/dashboard/dashboard-url";

type DashboardMonthSelectorProps = {
  monthView: MonthView;
  searchParams?: DashboardSearchParams;
};

const navButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function DashboardMonthSelector({
  monthView,
  searchParams,
}: DashboardMonthSelectorProps) {
  const { previousHref, nextHref } = buildDashboardMonthNavUrls(monthView, searchParams);
  const monthLabel = formatMonthLabel(monthView);

  return (
    <nav
      aria-label="בחירת חודש לדשבורד"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <Link href={previousHref} className={navButtonClassName}>
        חודש קודם
      </Link>
      <p className="min-w-36 px-2 text-center text-base font-semibold text-foreground sm:text-lg">
        {monthLabel}
      </p>
      <Link href={nextHref} className={navButtonClassName}>
        חודש הבא
      </Link>
    </nav>
  );
}
