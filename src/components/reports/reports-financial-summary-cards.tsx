import { formatCurrency } from "@/lib/financial/format-currency";
import type { ReportFinancialSummary } from "@/lib/reports/types";

type ReportsFinancialSummaryCardsProps = {
  financial: ReportFinancialSummary;
};

export function ReportsFinancialSummaryCards({ financial }: ReportsFinancialSummaryCardsProps) {
  const cards = [
    { title: "תקבול ברוטו (בפועל)", value: formatCurrency(financial.actualGrossRevenue) },
    { title: "תקבול ברוטו (פוטנציאלי)", value: formatCurrency(financial.potentialGrossRevenue) },
    { title: "מע״מ (בפועל)", value: formatCurrency(financial.actualVatAmount) },
    {
      title: "תקבול נטו לפני מדריך (בפועל)",
      value: formatCurrency(financial.actualNetRevenueBeforeInstructor),
    },
    { title: "שכר מדריך (בפועל)", value: formatCurrency(financial.actualInstructorPayout) },
    { title: "שכר מדריך (פוטנציאלי)", value: formatCurrency(financial.potentialInstructorPayout) },
    { title: "רווח ברוטו (בפועל)", value: formatCurrency(financial.actualGrossProfit) },
    { title: "רווח נקי (בפועל)", value: formatCurrency(financial.actualNetProfit) },
    { title: "רווח נקי (פוטנציאלי)", value: formatCurrency(financial.potentialNetProfit) },
  ] as const;

  return (
    <section aria-label="סיכום פיננסי" className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">סיכום פיננסי</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-border bg-surface p-4 sm:p-5"
          >
            <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
            <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
