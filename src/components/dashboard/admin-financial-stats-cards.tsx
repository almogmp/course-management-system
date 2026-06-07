import {
  DashboardFinancialCardGrid,
  type DashboardFinancialCard,
} from "@/components/dashboard/dashboard-financial-card-grid";
import { formatCurrency } from "@/lib/financial/format-currency";
import type {
  AdminFinancialDashboardStats,
  AdminFinancialPeriodStats,
} from "@/lib/financial/get-admin-financial-dashboard";

type AdminFinancialStatsCardsProps = {
  stats: AdminFinancialDashboardStats;
};

function buildPeriodCards(
  period: AdminFinancialPeriodStats,
  label: "היום" | "החודש",
): DashboardFinancialCard[] {
  return [
    {
      key: `${label}-gross`,
      title: `תקבול ברוטו ${label}`,
      value: formatCurrency(period.grossRevenue),
    },
    {
      key: `${label}-vat`,
      title: `מע״מ ${label}`,
      value: formatCurrency(period.vat),
    },
    {
      key: `${label}-instructor-cost`,
      title: `עלות מדריכים ${label}`,
      value: formatCurrency(period.instructorCost),
    },
    {
      key: `${label}-net-profit`,
      title: `רווח נקי ${label}`,
      value: formatCurrency(period.netProfit),
      emphasized: label === "החודש",
    },
    {
      key: `${label}-potential-gross`,
      title: `תקבול פוטנציאלי ${label}`,
      value: formatCurrency(period.potentialGrossRevenue),
    },
    {
      key: `${label}-potential-net-profit`,
      title: `רווח פוטנציאלי ${label}`,
      value: formatCurrency(period.potentialNetProfit),
    },
  ];
}

export function AdminFinancialStatsCards({ stats }: AdminFinancialStatsCardsProps) {
  return (
    <section aria-label="סיכום פיננסי" className="space-y-8">
      {stats.missingRateSessionCount > 0 ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {stats.missingRateSessionCount} מפגשים בחודש ללא תמחור מלא — יש להשלים מחיר מוסד או שכר
          מדריך.
        </p>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">נתוני היום</h2>
        <DashboardFinancialCardGrid cards={buildPeriodCards(stats.today, "היום")} columns={6} />
      </div>

      <div className="space-y-3 border-t border-border pt-8">
        <h2 className="text-lg font-semibold text-foreground">נתוני החודש</h2>
        <DashboardFinancialCardGrid cards={buildPeriodCards(stats.month, "החודש")} columns={6} />
      </div>
    </section>
  );
}
