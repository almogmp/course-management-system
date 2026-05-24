/** שמות ימים — ראשון עד שבת */
export const HEBREW_WEEKDAY_NAMES = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
] as const;

export type WeekDay = {
  dateKey: string;
  dayIndex: number;
  label: string;
  dayNumber: number;
  isToday: boolean;
};

export type WeekRange = {
  startDate: string;
  endDate: string;
  days: WeekDay[];
};

/** YYYY-MM-DD בזמן מקומי */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** תחילת שבוע (ראשון) עד שבת — לפי זמן מקומי */
export function getWeekRange(referenceDate: Date = new Date()): WeekRange {
  const local = new Date(referenceDate);
  local.setHours(0, 0, 0, 0);

  const weekStart = new Date(local);
  weekStart.setDate(local.getDate() - local.getDay());

  const days: WeekDay[] = [];

  const todayKey = toLocalDateKey(new Date());

  for (let offset = 0; offset < 7; offset += 1) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + offset);

    const dateKey = toLocalDateKey(dayDate);

    days.push({
      dateKey,
      dayIndex: offset,
      label: HEBREW_WEEKDAY_NAMES[offset],
      dayNumber: dayDate.getDate(),
      isToday: dateKey === todayKey,
    });
  }

  return {
    startDate: days[0].dateKey,
    endDate: days[6].dateKey,
    days,
  };
}

/** כותרת טווח שבועי בעברית */
export function formatWeekRangeLabel(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();

  if (sameMonth) {
    const monthYear = new Intl.DateTimeFormat("he-IL", {
      month: "long",
      year: "numeric",
    }).format(start);

    return `${start.getDate()}–${end.getDate()} ב${monthYear}`;
  }

  const startLabel = new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
  }).format(start);

  const endLabel = new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(end);

  return `${startLabel} – ${endLabel}`;
}

export function parseWeekStartParam(value: string | undefined): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T12:00:00`);

    if (!Number.isNaN(parsed.getTime())) {
      return getWeekRange(parsed).startDate;
    }
  }

  return getWeekRange().startDate;
}

export function shiftWeekStart(weekStart: string, deltaWeeks: number): string {
  const date = new Date(`${weekStart}T12:00:00`);
  date.setDate(date.getDate() + deltaWeeks * 7);

  return getWeekRange(date).startDate;
}

/** מקבץ מפגשים לפי תאריך YYYY-MM-DD */
export function groupSessionsByDate<T extends { session_date: string }>(
  sessions: T[],
): Record<string, T[]> {
  return sessions.reduce<Record<string, T[]>>((groups, session) => {
    const existing = groups[session.session_date] ?? [];
    existing.push(session);
    groups[session.session_date] = existing;
    return groups;
  }, {});
}
