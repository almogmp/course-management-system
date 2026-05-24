import type { SessionStatus } from "@/components/sessions/constants";
import { SESSION_STATUS_LABELS } from "@/components/sessions/constants";
import { cn } from "@/lib/utils";

type SessionStatusBadgeProps = {
  status: SessionStatus;
  isDelayed?: boolean;
  compact?: boolean;
  className?: string;
};

const statusStyles: Record<SessionStatus, string> = {
  planned: "border-blue-300 bg-blue-100 text-blue-950",
  arrived: "border-cyan-300 bg-cyan-100 text-cyan-950",
  in_progress: "border-violet-300 bg-violet-100 text-violet-950",
  completed: "border-green-300 bg-green-100 text-green-900",
  cancelled: "border-red-300 bg-red-100 text-red-900",
  deferred: "border-yellow-300 bg-yellow-100 text-yellow-950",
};

export function SessionStatusBadge({
  status,
  isDelayed = false,
  compact = false,
  className,
}: SessionStatusBadgeProps) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span
        className={cn(
          "inline-flex items-center rounded-md border font-semibold",
          compact ? "px-1 py-0 text-[10px]" : "px-2.5 py-1 text-xs sm:text-sm",
          statusStyles[status],
          className,
        )}
      >
        {SESSION_STATUS_LABELS[status]}
      </span>
      {isDelayed ? (
        <span
          className={cn(
            "inline-flex items-center rounded-md border border-orange-400 bg-orange-100 font-semibold text-orange-950",
            compact ? "px-1 py-0 text-[10px]" : "px-2 py-0.5 text-[10px] sm:text-xs",
          )}
        >
          באיחור
        </span>
      ) : null}
    </span>
  );
}
