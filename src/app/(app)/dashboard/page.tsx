import { Suspense } from "react";
import Link from "next/link";

import { parseMonthParam } from "@/components/calendar/month-calendar-utils";
import { AdminDashboardStatsCards } from "@/components/dashboard/admin-dashboard-stats-cards";
import { AdminFinancialStatsCards } from "@/components/dashboard/admin-financial-stats-cards";
import { AdminInstructorWorkloadTable } from "@/components/dashboard/admin-instructor-workload-table";
import { InstructorPayoutStatsCards } from "@/components/dashboard/instructor-payout-stats-cards";
import { DashboardCalendarSection } from "@/components/dashboard/dashboard-calendar-section";
import { DashboardOperationalLoader } from "@/components/dashboard/dashboard-operational-loader";
import { DashboardMonthSelector } from "@/components/dashboard/dashboard-month-selector";
import { getAdminDashboardData } from "@/components/dashboard/get-admin-dashboard-data";
import { getInstructorDashboardData } from "@/components/dashboard/get-instructor-dashboard-data";
import { getAdminFinancialDashboard } from "@/lib/financial/get-admin-financial-dashboard";
import { getInstructorPayoutDashboard } from "@/lib/financial/get-instructor-payout-dashboard";
import { InstructorDashboardStatsCards } from "@/components/dashboard/instructor-dashboard-stats-cards";
import { InstructorMonthlyWorkload } from "@/components/dashboard/instructor-monthly-workload";
import { InstructorSessionsSection } from "@/components/dashboard/instructor-sessions-section";
import { Container } from "@/components/ui/container";
import {
  CalendarSectionSkeleton,
  OperationalSectionsSkeleton,
} from "@/components/ui/page-skeletons";
import type { DashboardSearchParams } from "@/lib/dashboard/dashboard-url";
import { requireAuth } from "@/lib/auth/guards";

type DashboardPageProps = {
  searchParams?: DashboardSearchParams;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { user, profile } = await requireAuth();

  const isAdmin = profile?.role === "admin";
  const monthView = parseMonthParam(searchParams?.month);

  if (!isAdmin) {
    const [{ sessions, stats }, payoutStats] = await Promise.all([
      getInstructorDashboardData(monthView),
      getInstructorPayoutDashboard(monthView),
    ]);

    return (
      <Container as="main" className="flex flex-1 flex-col gap-8 py-8">
        <header className="space-y-2 text-start">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">אזור אישי</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {user.email}
            {" · מדריך"}
          </p>
        </header>

        <DashboardMonthSelector monthView={monthView} searchParams={searchParams} />

        <Suspense fallback={<OperationalSectionsSkeleton />}>
          <DashboardOperationalLoader isAdmin={false} />
        </Suspense>

        <InstructorDashboardStatsCards stats={stats} />

        <InstructorPayoutStatsCards stats={payoutStats} />

        <InstructorMonthlyWorkload workload={stats.workload} />

        <Suspense fallback={<CalendarSectionSkeleton />}>
          <DashboardCalendarSection isAdmin={false} searchParams={searchParams} />
        </Suspense>

        <InstructorSessionsSection sessions={sessions} />
      </Container>
    );
  }

  const [{ overview, workloadRows }, financialStats] = await Promise.all([
    getAdminDashboardData(monthView),
    getAdminFinancialDashboard(monthView),
  ]);

  return (
    <Container as="main" className="flex flex-1 flex-col gap-8 py-8">
      <header className="space-y-2 text-start">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">דשבורד</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {user.email}
          {" · מנהל מערכת"}
        </p>
      </header>

      <DashboardMonthSelector monthView={monthView} searchParams={searchParams} />

      <Suspense fallback={<OperationalSectionsSkeleton />}>
        <DashboardOperationalLoader isAdmin={true} />
      </Suspense>

      <AdminDashboardStatsCards overview={overview} />

      <AdminFinancialStatsCards stats={financialStats} />

      <AdminInstructorWorkloadTable rows={workloadRows} />

      <div className="flex flex-wrap gap-2 text-start">
        <Link
          href="/admin/payroll"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:text-base"
        >
          שכר מדריכים
        </Link>
        <Link
          href="/reports"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:text-base"
        >
          דוחות
        </Link>
        <Link
          href="/admin/instructors"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:text-base"
        >
          ניהול מדריכים
        </Link>
        <Link
          href="/admin/instructor-approvals"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:text-base"
        >
          אישור בקשות מדריכים
        </Link>
      </div>

      <Suspense fallback={<CalendarSectionSkeleton />}>
        <DashboardCalendarSection isAdmin={true} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
