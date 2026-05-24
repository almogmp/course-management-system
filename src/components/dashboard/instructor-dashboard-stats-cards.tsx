import { formatSessionHours } from "@/components/sessions/format";
import type { InstructorDashboardStats } from "@/components/dashboard/get-instructor-dashboard-data";

type InstructorDashboardStatsCardsProps = {
  stats: InstructorDashboardStats;
};

export function InstructorDashboardStatsCards({ stats }: InstructorDashboardStatsCardsProps) {
  const cards = [
    {
      title: "שעות מדריך החודש",
      value: formatSessionHours(stats.instructorHoursThisMonth),
      description: "סה״כ שעות מדריך בחודש הנבחר",
    },
    {
      title: "מפגשים שבוצעו",
      value: String(stats.completedThisMonth),
      description: "מפגשים שהושלמו בחודש הנבחר",
    },
    {
      title: "מפגשים מתוכננים",
      value: String(stats.plannedThisMonth),
      description: "מפגשים מתוכננים בחודש הנבחר",
    },
    {
      title: "ממתינים לאישור",
      value: String(stats.pendingApprovalThisMonth),
      description: "בקשות ביטול שממתינות לאישור מנהל",
    },
  ] as const;

  return (
    <section
      aria-label="סיכום אישי לחודש"
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
