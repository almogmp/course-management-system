import { cn } from "@/lib/utils";

type CalendarDayHeaderProps = {
  weekdayLabel: string;
  dayNumber: number;
  isToday?: boolean;
  hebrewDateLabel?: string;
  holidays?: string[];
  sessionCount?: number;
  compact?: boolean;
};

export function CalendarDayHeader({
  weekdayLabel,
  dayNumber,
  isToday = false,
  hebrewDateLabel,
  holidays = [],
  sessionCount,
  compact = false,
}: CalendarDayHeaderProps) {
  return (
    <header
      className={cn(
        "shrink-0 border-b border-border pb-1.5 text-center",
        isToday && "border-primary",
      )}
    >
      <p className={cn("font-medium", compact ? "text-[10px]" : "text-xs", isToday ? "text-primary" : "text-muted-foreground")}>
        {weekdayLabel}
      </p>
      <p className={cn("font-bold", compact ? "text-sm" : "text-base", isToday ? "text-primary" : "text-foreground")}>
        {dayNumber}
      </p>
      {hebrewDateLabel ? (
        <p className={cn("text-muted-foreground", compact ? "text-[9px] leading-tight" : "text-[10px] leading-tight")}>
          {hebrewDateLabel}
        </p>
      ) : null}
      {holidays.length > 0 ? (
        <p
          className={cn(
            "mt-0.5 font-medium text-amber-800",
            compact ? "text-[9px] leading-tight" : "text-[10px] leading-tight",
          )}
          title={holidays.join(", ")}
        >
          {holidays[0]}
          {holidays.length > 1 ? ` +${holidays.length - 1}` : ""}
        </p>
      ) : null}
      {typeof sessionCount === "number" && sessionCount > 0 ? (
        <p className="text-[10px] text-muted-foreground">{sessionCount} מפגשים</p>
      ) : null}
    </header>
  );
}
