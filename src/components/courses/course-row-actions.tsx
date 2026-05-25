import Link from "next/link";

import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
import { CourseAdminLinks } from "@/components/courses/course-admin-links";
import { MOBILE_CARD_ACTIONS_CLASS, TABLE_ROW_ACTIONS_CLASS } from "@/components/ui/mobile-card-classes";
import { cn } from "@/lib/utils";

type CourseRowActionsProps = {
  courseId: string;
  courseName: string;
  showAdminLinks: boolean;
  variant?: "card" | "table";
};

/** פעולות שורת קורס — משותף למובייל ולדסקטופ. */
export function CourseRowActions({
  courseId,
  courseName,
  showAdminLinks,
  variant = "table",
}: CourseRowActionsProps) {
  const wrapClass = variant === "card" ? MOBILE_CARD_ACTIONS_CLASS : TABLE_ROW_ACTIONS_CLASS;

  if (showAdminLinks) {
    return (
      <div className={cn(wrapClass, "app-table-actions")}>
        <CourseAdminLinks courseId={courseId} compact={variant === "table"} />
        <AdminDeleteDialog
          entityType="course"
          entityId={courseId}
          entityLabel={courseName}
          returnPath="/courses"
          triggerLabel="מחק"
          compact
        />
      </div>
    );
  }

  return (
    <div className={cn(wrapClass, "app-table-actions")}>
      <Link
        href={`/courses/${courseId}/sessions`}
        className={
          variant === "card"
            ? "inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            : "font-medium text-primary underline-offset-4 hover:underline"
        }
      >
        ניהול מפגשים
      </Link>
    </div>
  );
}
