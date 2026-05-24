import { COURSE_STATUS_LABELS, type CourseStatus } from "@/components/courses/constants";
import { cn } from "@/lib/utils";

type CourseStatusBadgeProps = {
  status: CourseStatus;
  className?: string;
};

const statusStyles: Record<CourseStatus, string> = {
  active: "border-green-200 bg-green-50 text-green-800",
  frozen: "border-amber-200 bg-amber-50 text-amber-900",
  ended: "border-border bg-muted text-muted-foreground",
};

export function CourseStatusBadge({ status, className }: CourseStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium sm:text-sm",
        statusStyles[status],
        className,
      )}
    >
      {COURSE_STATUS_LABELS[status]}
    </span>
  );
}
