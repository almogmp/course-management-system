import { CalendarDayHeader } from "@/components/calendar/calendar-day-header";
import { CompactCalendarSessionCard } from "@/components/calendar/compact-calendar-session-card";
import { WeeklyCalendarEmptyState } from "@/components/calendar/weekly-calendar-empty-state";
import type { WeeklyCalendarSession } from "@/components/calendar/types";
import type { WeekDay } from "@/lib/date/week";
import { groupSessionsByDate } from "@/lib/date/week";
import { cn } from "@/lib/utils";

type WeeklyCalendarProps = {
  weekDays: WeekDay[];
  sessions: WeeklyCalendarSession[];
};

function sortSessionsByStartTime(
  daySessions: WeeklyCalendarSession[],
): WeeklyCalendarSession[] {
  return [...daySessions].sort((a, b) => a.start_time.localeCompare(b.start_time));
}

function DaySessionsList({
  daySessions,
  dense,
}: {
  daySessions: WeeklyCalendarSession[];
  dense: boolean;
}) {
  return (
    <ul className={cn("space-y-1", dense && "space-y-0.5")}>
      {daySessions.map((session) => (
        <li key={session.id}>
          <CompactCalendarSessionCard session={session} dense={dense} />
        </li>
      ))}
    </ul>
  );
}

/** Scrollable only when content exceeds max height; never clips sessions. */
function DaySessionsScrollArea({
  daySessions,
  dense,
  className,
}: {
  daySessions: WeeklyCalendarSession[];
  dense: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-0 overflow-y-auto overscroll-contain",
        className,
      )}
    >
      <DaySessionsList daySessions={daySessions} dense={dense} />
    </div>
  );
}

export function WeeklyCalendar({ weekDays, sessions }: WeeklyCalendarProps) {
  const sessionsByDate = groupSessionsByDate(sessions);

  for (const dateKey of Object.keys(sessionsByDate)) {
    sessionsByDate[dateKey] = sortSessionsByStartTime(sessionsByDate[dateKey]);
  }

  const hasSessions = sessions.length > 0;
  const maxPerDay = Math.max(0, ...weekDays.map((day) => (sessionsByDate[day.dateKey] ?? []).length));
  const dense = maxPerDay >= 4;

  return (
    <>
      {!hasSessions ? <WeeklyCalendarEmptyState /> : null}

      <div className="space-y-6 md:hidden">
        {weekDays.map((day) => {
          const daySessions = sessionsByDate[day.dateKey] ?? [];
          const dayDense = dense || daySessions.length >= 3;
          const useScrollCap = daySessions.length >= 4;

          return (
            <section key={day.dateKey} className="min-h-0 text-start">
              <div className="mb-2 shrink-0">
                <CalendarDayHeader
                  weekdayLabel={day.label}
                  dayNumber={day.dayNumber}
                  isToday={day.isToday}
                  hebrewDateLabel={day.hebrewDateLabel}
                  holidays={day.holidays}
                  sessionCount={daySessions.length}
                />
              </div>
              {daySessions.length === 0 ? (
                <p className="text-xs text-muted-foreground">אין מפגשים</p>
              ) : useScrollCap ? (
                <DaySessionsScrollArea
                  daySessions={daySessions}
                  dense={dayDense}
                  className="max-h-[min(28rem,65vh)]"
                />
              ) : (
                <DaySessionsList daySessions={daySessions} dense={dayDense} />
              )}
            </section>
          );
        })}
      </div>

      <div className="hidden min-h-0 gap-2 md:grid md:grid-cols-7 md:items-stretch">
        {weekDays.map((day) => {
          const daySessions = sessionsByDate[day.dateKey] ?? [];
          const dayDense = dense || daySessions.length >= 3;

          return (
            <div
              key={day.dateKey}
              className={cn(
                "flex min-h-0 flex-col rounded-xl border bg-surface p-2 sm:min-h-52",
                day.isToday ? "border-primary ring-2 ring-primary/20" : "border-border",
              )}
            >
              <div className="mb-2 shrink-0">
                <CalendarDayHeader
                  weekdayLabel={day.label}
                  dayNumber={day.dayNumber}
                  isToday={day.isToday}
                  hebrewDateLabel={day.hebrewDateLabel}
                  holidays={day.holidays}
                  sessionCount={daySessions.length}
                  compact
                />
              </div>
              {daySessions.length === 0 ? (
                <p className="flex flex-1 items-center justify-center text-center text-xs text-muted-foreground">
                  —
                </p>
              ) : (
                <DaySessionsScrollArea
                  daySessions={daySessions}
                  dense={dayDense}
                  className="max-h-[min(24rem,70vh)] flex-1 lg:max-h-[min(28rem,75vh)] xl:max-h-[min(32rem,80vh)]"
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
