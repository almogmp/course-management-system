import Link from "next/link";

import { SessionStatusBadge } from "@/components/sessions/session-status-badge";
import { formatSessionTimeRange } from "@/components/sessions/format";
import type { WeeklyCalendarSession } from "@/components/calendar/types";
import { cn } from "@/lib/utils";

type CompactCalendarSessionCardProps = {
  session: WeeklyCalendarSession;
  dense?: boolean;
};

export function CompactCalendarSessionCard({
  session,
  dense = false,
}: CompactCalendarSessionCardProps) {
  const isActive = session.status === "in_progress";

  return (
    <Link
      href={`/courses/${session.course_id}/sessions`}
      className={cn(
        "group block rounded border bg-background text-start shadow-sm transition-colors",
        "hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        dense ? "border-border/80 px-1 py-0.5" : "border-border px-1.5 py-1",
        session.is_delayed && "border-orange-400 bg-orange-50/80 hover:bg-orange-50",
        isActive && "border-violet-400 bg-violet-50/90 ring-1 ring-violet-300/60",
      )}
    >
      <p
        className={cn(
          "truncate font-semibold leading-tight text-foreground",
          dense ? "text-[9px] sm:text-[10px]" : "text-[10px] sm:text-xs",
        )}
        dir="ltr"
      >
        {formatSessionTimeRange(session.start_time, session.end_time)}
      </p>
      {session.instructor_name ? (
        <p
          className={cn(
            "truncate font-medium text-foreground/90",
            dense ? "text-[9px]" : "text-[10px] sm:text-xs",
          )}
        >
          {session.instructor_name}
        </p>
      ) : null}
      {session.institution_name ? (
        <p
          className={cn(
            "truncate text-muted-foreground",
            dense ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[10px]",
          )}
        >
          {session.institution_name}
        </p>
      ) : null}
      <p
        className={cn(
          "truncate text-muted-foreground",
          dense ? "text-[8px] sm:text-[9px]" : "text-[9px] sm:text-[10px]",
        )}
      >
        {session.course_name ?? "—"}
      </p>
      <div className="mt-0.5 flex items-center gap-0.5">
        <SessionStatusBadge
          status={session.status}
          isDelayed={session.is_delayed}
          compact
        />
        {isActive ? (
          <span className="inline-flex rounded border border-violet-400 bg-violet-100 px-1 py-0 text-[8px] font-semibold text-violet-950 sm:text-[9px]">
            פעיל
          </span>
        ) : null}
      </div>
    </Link>
  );
}
