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

function DenseDaySessions({ daySessions, dense }: { daySessions: WeeklyCalendarSession[]; dense: boolean }) {
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
  const maxPerDay = Math.max(0, ...weekDays.map((day) => (sessionsByDate[day.dateKey] ?? []).length));
  const dense = maxPerDay >= 4;

  return (
    <>
      {!hasSessions ? <WeeklyCalendarEmptyState /> : null}

      <div className="space-y-6 md:hidden">
        {weekDays.map((day) => {
          const daySessions = sessionsByDate[day.dateKey] ?? [];

          return (
            <section key={day.dateKey} className="text-start">
              <header
                className={cn(
                  "mb-2 flex items-baseline gap-2 border-b border-border pb-2",
                  day.isToday && "border-primary",
                )}
              >
                <h3 className={cn("text-sm font-semibold", day.isToday ? "text-primary" : "text-foreground")}>
                  {day.label}
                </h3>
                <span className={cn("text-sm", day.isToday ? "text-primary" : "text-muted-foreground")}>
                  {day.dayNumber}
                  {daySessions.length > 0 ? ` · ${daySessions.length} מפגשים` : ""}
                </span>
              </header>
              {daySessions.length === 0 ? (
                <p className="text-xs text-muted-foreground">אין מפגשים</p>
              ) : (
                <DenseDaySessions daySessions={daySessions} dense={dense} />
              )}
            </section>
          );
        })}
      </div>

      <div className="hidden gap-2 md:grid md:grid-cols-7">
        {weekDays.map((day) => {
          const daySessions = sessionsByDate[day.dateKey] ?? [];

          return (
            <div
              key={day.dateKey}
              className={cn(
                "flex min-h-52 max-h-72 flex-col rounded-xl border bg-surface p-2 lg:max-h-80 xl:max-h-96",
                day.isToday ? "border-primary ring-2 ring-primary/20" : "border-border",
              )}
            >
              <header
                className={cn(
                  "mb-2 shrink-0 border-b border-border pb-1.5 text-center",
                  day.isToday && "border-primary",
                )}
              >
                <p className={cn("text-xs font-medium", day.isToday ? "text-primary" : "text-muted-foreground")}>
                  {day.label}
                </p>
                <p className={cn("text-base font-bold", day.isToday ? "text-primary" : "text-foreground")}>
                  {day.dayNumber}
                </p>
                {daySessions.length > 0 ? (
                  <p className="text-[10px] text-muted-foreground">{daySessions.length} מפגשים</p>
                ) : null}
              </header>
              {daySessions.length === 0 ? (
                <p className="flex flex-1 items-center justify-center text-center text-xs text-muted-foreground">
                  —
                </p>
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <DenseDaySessions daySessions={daySessions} dense={dense || daySessions.length >= 3} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
