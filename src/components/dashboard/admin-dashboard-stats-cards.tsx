import { formatSessionHours } from "@/components/sessions/format";
import type { MonthlyOverviewStats } from "@/lib/dashboard/workload";

type AdminDashboardStatsCardsProps = {
  overview: MonthlyOverviewStats;
};

export function AdminDashboardStatsCards({ overview }: AdminDashboardStatsCardsProps) {
  const cards = [
    {
      title: "שעות מדריך החודש",
      value: formatSessionHours(overview.instructorHours),
      description: "סה״כ שעות מדריך בחודש הנבחר",
    },
    {
      title: "שעות חברה החודש",
      value: formatSessionHours(overview.companyHours),
      description: "סה״כ שעות חברה בחודש הנבחר",
    },
    {
      title: "מפגשים שבוצעו",
      value: String(overview.completedCount),
      description: "מפגשים שהושלמו בחודש הנבחר",
    },
    {
      title: "מפגשים שבוטלו",
      value: String(overview.cancelledCount),
      description: "מפגשים שבוטלו בחודש הנבחר",
    },
  ] as const;

  return (
    <section
      aria-label="סיכום חודשי"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-xl border border-border bg-surface p-5 sm:p-6"
        >
          <h2 className="text-sm font-medium text-muted-foreground">{card.title}</h2>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {card.value}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {card.description}
          </p>
        </article>
      ))}
    </section>
  );
}
