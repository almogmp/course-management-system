import { formatCurrency } from "@/lib/financial/format-currency";
import type { SessionsMonthSummary } from "@/lib/sessions/compute-month-summary";
import { cn } from "@/lib/utils";

type SessionsMonthSummaryProps = {
  summary: SessionsMonthSummary;
  showFinancials: boolean;
  monthLabel: string;
};

type SummaryCard = {
  label: string;
  value: string;
};

function formatHours(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

function SummaryCardGrid({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-xl border border-border bg-surface p-4 text-center",
            "flex flex-col items-center justify-center gap-1",
          )}
        >
          <p className="text-xs text-muted-foreground sm:text-sm">{card.label}</p>
          <p className="text-lg font-semibold text-foreground sm:text-xl">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function SessionsMonthSummaryPanel({
  summary,
  showFinancials,
  monthLabel,
}: SessionsMonthSummaryProps) {
  const baseCards: SummaryCard[] = [
    { label: "סה״כ מפגשים", value: String(summary.totalSessions) },
    { label: "סה״כ שעות מדריך", value: formatHours(summary.totalInstructorHours) },
    { label: "סה״כ שעות חברה", value: formatHours(summary.totalCompanyHours) },
    { label: "מפגשים שבוצעו", value: String(summary.completedCount) },
    { label: "מפגשים מתוכננים", value: String(summary.plannedCount) },
    { label: "מפגשים פעילים", value: String(summary.activeCount) },
    { label: "מפגשים שבוטלו", value: String(summary.cancelledCount) },
    { label: "מפגשים נדחים", value: String(summary.deferredCount) },
  ];

  const financialCards: SummaryCard[] = showFinancials
    ? [
        {
          label: "תקבול ברוטו",
          value: formatCurrency(summary.totalGrossRevenue ?? 0),
        },
        {
          label: "מע״מ",
          value: formatCurrency(summary.totalVat ?? 0),
        },
        {
          label: "תקבול נטו לפני מדריך",
          value: formatCurrency(summary.totalNetRevenue ?? 0),
        },
        {
          label: "שכר מדריך",
          value: formatCurrency(summary.totalInstructorPayout ?? 0),
        },
        {
          label: "רווח ברוטו",
          value: formatCurrency(summary.totalGrossProfit ?? 0),
        },
        {
          label: "רווח נקי",
          value: formatCurrency(summary.totalNetProfit ?? 0),
        },
      ]
    : [];

  const instructorCards = showFinancials
    ? baseCards
    : baseCards.filter((card) => card.label !== "סה״כ שעות חברה");

  return (
    <section aria-labelledby="sessions-month-summary-heading" className="space-y-3">
      <h2
        id="sessions-month-summary-heading"
        className="text-center text-base font-semibold text-foreground md:text-start"
      >
        סיכום חודשי — {monthLabel}
      </h2>
      <SummaryCardGrid cards={[...instructorCards, ...financialCards]} />
      {showFinancials ? (
        <p className="text-center text-xs text-muted-foreground md:text-start">
          סכומים כספיים מחושבים ממפגשים שבוצעו בלבד (כולל מע״מ 18% בתקבול ברוטו); מפגשים שבוטלו
          אינם נכללים.
        </p>
      ) : null}
    </section>
  );
}
