import { formatSessionHours } from "@/components/sessions/format";
import type { ReportSummary } from "@/lib/reports/types";

type ReportsSummaryCardsProps = {
  summary: ReportSummary;
};

export function ReportsSummaryCards({ summary }: ReportsSummaryCardsProps) {
  const cards = [
    {
      title: "סך מפגשים",
      value: String(summary.totalSessions),
      description: "מפגשים בחודש הנבחר",
    },
    {
      title: "מפגשים שבוצעו",
      value: String(summary.completedCount),
      description: "מפגשים שהושלמו",
    },
    {
      title: "מפגשים שבוטלו",
      value: String(summary.cancelledCount),
      description: "מפגשים שבוטלו",
    },
    {
      title: "שעות מדריך",
      value: formatSessionHours(summary.instructorHours),
      description: "סה״כ שעות מדריך",
    },
    {
      title: "שעות חברה",
      value: formatSessionHours(summary.companyHours),
      description: "סה״כ שעות חברה",
    },
  ] as const;

  return (
    <section
      aria-label="סיכום דוח חודשי"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2 className="text-sm font-medium text-muted-foreground">{card.title}</h2>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{card.description}</p>
        </article>
      ))}
    </section>
  );
}
