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

const MOBILE_SCROLL_SESSION_THRESHOLD = 6;

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

export function WeeklyCalendar({ weekDays, sessions }: WeeklyCalendarProps) {
  const sessionsByDate = groupSessionsByDate(sessions);

  for (const dateKey of Object.keys(sessionsByDate)) {
    sessionsByDate[dateKey] = sortSessionsByStartTime(sessionsByDate[dateKey]);
  }

  const hasSessions = sessions.length > 0;
  const maxPerDay = Math.max(
    0,
    ...weekDays.map((day) => (sessionsByDate[day.dateKey] ?? []).length),
  );
  const dense = maxPerDay >= 4;

  return (
    <>
      {!hasSessions ? <WeeklyCalendarEmptyState /> : null}

      <div className="space-y-6 md:hidden">
        {weekDays.map((day) => {
          const daySessions = sessionsByDate[day.dateKey] ?? [];
          const dayDense = dense || daySessions.length >= 3;
          const useMobileScroll = daySessions.length >= MOBILE_SCROLL_SESSION_THRESHOLD;

          return (
            <section key={day.dateKey} className="text-start">
              <div className="mb-2">
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
              ) : useMobileScroll ? (
                <div className="max-h-[min(32rem,70vh)] overflow-y-auto overscroll-contain">
                  <DaySessionsList daySessions={daySessions} dense={dayDense} />
                </div>
              ) : (
                <DaySessionsList daySessions={daySessions} dense={dayDense} />
              )}
            </section>
          );
        })}
      </div>

      <div className="hidden md:grid md:grid-cols-7 md:items-stretch md:gap-2">
        {weekDays.map((day) => {
          const daySessions = sessionsByDate[day.dateKey] ?? [];
          const dayDense = dense || daySessions.length >= 3;

          return (
            <div
              key={day.dateKey}
              className={cn(
                "flex h-full flex-col rounded-xl border bg-surface p-2",
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
              <div className="flex flex-1 flex-col">
                {daySessions.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground">—</p>
                ) : (
                  <DaySessionsList daySessions={daySessions} dense={dayDense} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
