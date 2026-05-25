import { formatCurrency } from "@/lib/financial/format-currency";
import type { AdminFinancialDashboardStats } from "@/lib/financial/get-admin-financial-dashboard";

type AdminFinancialStatsCardsProps = {
  stats: AdminFinancialDashboardStats;
};

export function AdminFinancialStatsCards({ stats }: AdminFinancialStatsCardsProps) {
  const cards = [
    {
      title: "תקבול ברוטו היום (בפועל)",
      value: formatCurrency(stats.todayActualGrossRevenue),
      description: "מפגשים שבוצעו היום — כולל מע״מ",
    },
    {
      title: "תקבול ברוטו היום (פוטנציאלי)",
      value: formatCurrency(stats.todayPotentialGrossRevenue),
      description: "כולל מתוכננים פעילים היום",
    },
    {
      title: "רווח נקי החודש (בפועל)",
      value: formatCurrency(stats.monthActualNetProfit),
      description: "נטו לפני מדריך פחות שכר — מפגשים שבוצעו",
    },
    {
      title: "רווח נקי החודש (פוטנציאלי)",
      value: formatCurrency(stats.monthPotentialNetProfit),
      description: "תחזית לפי מפגשים פעילים/מתוכננים",
    },
    {
      title: "רווח ברוטו החודש (בפועל)",
      value: formatCurrency(stats.monthActualGrossProfit),
      description: "תקבול ברוטו פחות שכר מדריך",
    },
    {
      title: "שכר מדריכים החודש (בפועל)",
      value: formatCurrency(stats.monthActualInstructorPayout),
      description: "ללא ניכוי מע״מ — מפגשים שבוצעו",
    },
    {
      title: "שכר מדריכים החודש (פוטנציאלי)",
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
