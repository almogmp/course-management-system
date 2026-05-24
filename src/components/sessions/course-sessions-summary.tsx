import { formatSessionHours } from "@/components/sessions/format";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";

type CourseSessionsSummaryProps = {
  sessions: CourseSessionListItem[];
};

export function CourseSessionsSummary({ sessions }: CourseSessionsSummaryProps) {
  const totalSessions = sessions.length;
  const totalInstructorHours = sessions.reduce(
    (sum, session) => sum + session.instructor_hours,
    0,
  );
  const totalCompanyHours = sessions.reduce((sum, session) => sum + session.company_hours, 0);
  const completedSessions = sessions.filter((session) => session.status === "completed").length;

  const cards = [
    {
      title: "סך מפגשים",
      value: String(totalSessions),
      description: "מפגשים רשומים לקורס",
    },
    {
      title: "שעות מדריך",
      value: formatSessionHours(totalInstructorHours),
      description: "סה״כ שעות מדריך",
    },
    {
      title: "שעות חברה",
      value: formatSessionHours(totalCompanyHours),
      description: "סה״כ שעות חברה",
    },
    {
      title: "מפגשים שבוצעו",
      value: String(completedSessions),
      description: "מפגשים בסטטוס בוצע",
    },
  ] as const;

  return (
    <section
      aria-label="סיכום מפגשים"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-xl border border-border bg-surface p-4 sm:p-5"
        >
          <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
          <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{card.value}</p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{card.description}</p>
        </article>
      ))}
    </section>
  );
}
