import Link from "next/link";

type CourseAdminLinksProps = {
  courseId: string;
  compact?: boolean;
};

export function CourseAdminLinks({ courseId, compact = false }: CourseAdminLinksProps) {
  const base = `/courses/${courseId}/sessions`;
  const linkClass = compact
    ? "text-sm font-medium text-primary underline-offset-4 hover:underline"
    : "inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted";

  return (
    <div
      className={
        compact
          ? "app-table-actions flex flex-wrap items-center justify-center gap-2"
          : "flex flex-wrap items-center justify-center gap-2"
      }
    >
      <Link href={base} className={linkClass}>
        מפגשים
      </Link>
      <Link href={`${base}#course-rates`} className={linkClass}>
        תמחור
      </Link>
      <Link href={`${base}#course-hours`} className={linkClass}>
        שעות
      </Link>
    </div>
  );
}
