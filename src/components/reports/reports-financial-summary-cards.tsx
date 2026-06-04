import { formatCurrency } from "@/lib/financial/format-currency";
import type { PartnerFinancialReport } from "@/lib/reports/partner-report-types";

type ReportsFinancialSummaryCardsProps = {
  report: PartnerFinancialReport;
};

export function ReportsFinancialSummaryCards({ report }: ReportsFinancialSummaryCardsProps) {
  const { totals } = report;

  const cards = [
    { title: "תקבול ברוטו", value: formatCurrency(totals.grossRevenue) },
    { title: "מע״מ", value: formatCurrency(totals.vat) },
    { title: "עלות מדריכים", value: formatCurrency(totals.instructorCost) },
    { title: "רווח גולמי", value: formatCurrency(totals.grossProfit) },
  ] as const;

  return (
    <section aria-label="סיכום פיננסי" className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">סיכום כספי</h2>
      <p className="text-sm text-muted-foreground">
        מפגשים שבוצעו בלבד · {totals.completedSessionCount} מפגשים
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
