import { formatCurrency } from "@/lib/financial/format-currency";
import type { AdminFinancialDashboardStats } from "@/lib/financial/get-admin-financial-dashboard";

type AdminFinancialStatsCardsProps = {
  stats: AdminFinancialDashboardStats;
};

export function AdminFinancialStatsCards({ stats }: AdminFinancialStatsCardsProps) {
  const cards = [
    {
      title: "הכנסה בפועל היום",
      value: formatCurrency(stats.todayActualRevenue),
      description: "מפגשים שבוצעו היום",
    },
    {
      title: "הכנסה פוטנציאלית היום",
      value: formatCurrency(stats.todayPotentialRevenue),
      description: "כולל מתוכננים (ללא בוטלים/ממתינים)",
    },
    {
      title: "רווח בפועל החודש",
      value: formatCurrency(stats.monthActualProfit),
      description: "הכנסה פחות שכר מדריכים — בוצע",
    },
    {
      title: "רווח פוטנציאלי החודש",
      value: formatCurrency(stats.monthPotentialProfit),
      description: "תחזית לפי מפגשים פעילים בחודש",
    },
    {
      title: "שכר מדריכים בפועל החודש",
      value: formatCurrency(stats.monthActualInstructorPayout),
      description: "מפגשים שבוצעו בלבד",
    },
    {
      title: "שכר מדריכים פוטנציאלי החודש",
      value: formatCurrency(stats.monthPotentialInstructorPayout),
      description: "כולל מתוכננים בחודש",
    },
  ] as const;

  return (
    <section aria-label="סיכום פיננסי" className="space-y-3">
      {stats.missingRateSessionCount > 0 ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {stats.missingRateSessionCount} מפגשים בחודש ללא תמחור מלא — יש להשלים מחיר מוסד או שכר מדריך.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-border bg-surface p-5 sm:p-6"
          >
            <h2 className="text-sm font-medium text-muted-foreground">{card.title}</h2>
            <p className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {card.value}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
