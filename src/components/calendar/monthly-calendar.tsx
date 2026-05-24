import { CompactCalendarSessionCard } from "@/components/calendar/compact-calendar-session-card";
import type { WeeklyCalendarSession } from "@/components/calendar/types";
import type { MonthCalendarDay } from "@/components/calendar/month-calendar-utils";
import { HEBREW_WEEKDAY_NAMES } from "@/components/calendar/month-calendar-utils";
import { groupSessionsByDate } from "@/lib/date/week";
import { cn } from "@/lib/utils";

type MonthlyCalendarProps = {
  calendarDays: MonthCalendarDay[];
  sessions: WeeklyCalendarSession[];
};

function sortSessionsByStartTime(
  daySessions: WeeklyCalendarSession[],
): WeeklyCalendarSession[] {
  return [...daySessions].sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function MonthlyCalendar({ calendarDays, sessions }: MonthlyCalendarProps) {
  const sessionsByDate = groupSessionsByDate(sessions);

  for (const dateKey of Object.keys(sessionsByDate)) {
    sessionsByDate[dateKey] = sortSessionsByStartTime(sessionsByDate[dateKey]);
  }

  const maxPerDay = Math.max(0, ...calendarDays.map((day) => (sessionsByDate[day.dateKey] ?? []).length));
  const useDenseLayout = maxPerDay >= 3;

  return (
    <>
      <div className="grid grid-cols-7 gap-1 border-b border-border pb-2 text-center text-xs font-medium text-muted-foreground sm:text-sm">
        {HEBREW_WEEKDAY_NAMES.map((weekday) => (
          <div key={weekday} className="py-1">
            {weekday}
          </div>
        ))}
      </div>

      <div className="mt-1 overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const daySessions = sessionsByDate[day.dateKey] ?? [];
          const dayDense = useDenseLayout || daySessions.length >= 3;

          return (
            <div
              key={day.dateKey}
              className={cn(
                "flex min-h-28 max-h-36 flex-col rounded-lg border p-1 sm:min-h-32 sm:max-h-44 lg:max-h-52",
                day.isToday && "border-primary bg-primary/5 ring-1 ring-primary/30",
                !day.isToday && day.isCurrentMonth && "border-border bg-background",
                !day.isToday && !day.isCurrentMonth && "border-border/60 bg-muted/30",
              )}
            >
              <div
                className={cn(
                  "mb-1 flex shrink-0 items-center justify-between gap-1 px-0.5 text-xs font-semibold",
                  day.isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                  day.isToday && "text-primary",
                )}
              >
                <span>{day.dayNumber}</span>
                {daySessions.length > 0 ? (
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {daySessions.length}
                  </span>
                ) : null}
              </div>

              <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain">
                {daySessions.map((session) => (
                  <li key={session.id}>
                    <CompactCalendarSessionCard session={session} dense={dayDense} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        </div>
      </div>
    </>
  );
}
