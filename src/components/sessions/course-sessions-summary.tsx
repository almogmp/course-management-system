import { formatSessionHours } from "@/components/sessions/format";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import {
  computeCourseHoursSummary,
  formatHoursSummaryLine,
} from "@/lib/courses/course-hours";

type CourseSessionsSummaryProps = {
  sessions: CourseSessionListItem[];
  targetInstructorHours: number | null;
};

export function CourseSessionsSummary({
  sessions,
  targetInstructorHours,
}: CourseSessionsSummaryProps) {
  const summary = computeCourseHoursSummary(sessions, targetInstructorHours);

  const cards = [
    {
      title: "סך מפגשים",
      value: String(summary.totalSessions),
      description: "מפגשים רשומים לקורס",
    },
    {
      title: "שעות מדריך (מתוכנן)",
      value: formatHoursSummaryLine(summary.plannedInstructorHours),
      description: "מפגשים שטרם בוצעו/בוטלו",
    },
    {
      title: "שעות מדריך (בוצע)",
      value: formatHoursSummaryLine(summary.completedInstructorHours),
      description: "מפגשים בסטטוס בוצע",
    },
    {
      title: "סה״כ שעות מדריך",
      value: formatHoursSummaryLine(summary.totalInstructorHours),
      description: "כל המפגשים",
    },
    {
      title: "סה״כ שעות חברה",
      value: formatSessionHours(summary.totalCompanyHours),
      description: "שעות חברה לפי מפגשים",
    },
    ...(summary.targetInstructorHours !== null
      ? [
          {
            title: "יעד שעות",
            value: formatHoursSummaryLine(summary.targetInstructorHours),
            description: summary.remainingInstructorHours !== null
              ? `נותרו ${formatHoursSummaryLine(summary.remainingInstructorHours)}`
              : "הסכם מוסד",
          },
        ]
      : []),
  ] as const;

  return (
    <section
      id="course-hours"
      aria-label="סיכום שעות קורס"
      className="scroll-mt-24 space-y-3"
    >
      {summary.exceedsTarget ? (
        <p
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          שעות מתוכננות ובוצעות חורגות מיעד השעות שהוגדר לקורס.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      </div>
    </section>
  );
}
