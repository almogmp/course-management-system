import { formatCurrency } from "@/lib/financial/format-currency";
import type { InstructorPayoutDashboardStats } from "@/lib/financial/get-instructor-payout-dashboard";

type InstructorPayoutStatsCardsProps = {
  stats: InstructorPayoutDashboardStats;
};

export function InstructorPayoutStatsCards({ stats }: InstructorPayoutStatsCardsProps) {
  const cards = [
    {
      title: "השכר שלי היום בפועל",
      value: formatCurrency(stats.todayActualPayout),
    },
    {
      title: "השכר שלי היום פוטנציאלי",
      value: formatCurrency(stats.todayPotentialPayout),
    },
    {
      title: "השכר שלי השבוע בפועל",
      value: formatCurrency(stats.weekActualPayout),
    },
    {
      title: "השכר שלי השבוע פוטנציאלי",
      value: formatCurrency(stats.weekPotentialPayout),
    },
    {
      title: "השכר שלי החודש בפועל",
      value: formatCurrency(stats.monthActualPayout),
    },
    {
      title: "השכר שלי החודש פוטנציאלי",
      value: formatCurrency(stats.monthPotentialPayout),
    },
  ] as const;

  return (
    <section
      aria-label="סיכום שכר"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-xl border border-border bg-surface p-5 sm:p-6"
        >
          <h2 className="text-sm font-medium text-muted-foreground">{card.title}</h2>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {card.value}
          </p>
        </article>
      ))}
    </section>
  );
}
