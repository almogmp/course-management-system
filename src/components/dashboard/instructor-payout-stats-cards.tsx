import {
  DashboardFinancialCardGrid,
  type DashboardFinancialCard,
} from "@/components/dashboard/dashboard-financial-card-grid";
import { formatSessionHours } from "@/components/sessions/format";
import { formatCurrency } from "@/lib/financial/format-currency";
import type {
  InstructorFinancialPeriodStats,
  InstructorPayoutDashboardStats,
} from "@/lib/financial/get-instructor-payout-dashboard";

type InstructorPayoutStatsCardsProps = {
  stats: InstructorPayoutDashboardStats;
};

function buildPeriodCards(
  period: InstructorFinancialPeriodStats,
  label: "היום" | "החודש",
): DashboardFinancialCard[] {
  return [
    {
      key: `${label}-hours`,
      title: `שעות ${label}`,
      value: formatSessionHours(period.hours),
    },
    {
      key: `${label}-actual-payout`,
      title: `שכר שבוצע ${label}`,
      value: formatCurrency(period.actualPayout),
    },
    {
      key: `${label}-potential-payout`,
      title: `שכר פוטנציאלי ${label}`,
      value: formatCurrency(period.potentialPayout),
    },
  ];
}

export function InstructorPayoutStatsCards({ stats }: InstructorPayoutStatsCardsProps) {
  return (
    <section aria-label="סיכום שכר" className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">נתוני היום</h2>
        <DashboardFinancialCardGrid cards={buildPeriodCards(stats.today, "היום")} columns={3} />
      </div>

      <div className="space-y-3 border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground">נתוני החודש</h2>
        <DashboardFinancialCardGrid cards={buildPeriodCards(stats.month, "החודש")} columns={3} />
      </div>
    </section>
  );
}
