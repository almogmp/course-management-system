import { HEBREW_WEEKDAY_NAMES, toLocalDateKey } from "@/lib/date/week";

export type MonthCalendarDay = {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hebrewDateLabel?: string;
  holidays?: string[];
};

export type MonthView = {
  year: number;
  month: number;
};

export function getTodayMonthView(): MonthView {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
}

export function shiftMonthView(view: MonthView, delta: number): MonthView {
  const date = new Date(view.year, view.month + delta, 1);

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

export function formatMonthLabel(view: MonthView): string {
  return new Intl.DateTimeFormat("he-IL", {
    month: "long",
    year: "numeric",
  }).format(new Date(view.year, view.month, 1));
}

export function formatMonthParam(view: MonthView): string {
  const month = String(view.month + 1).padStart(2, "0");

  return `${view.year}-${month}`;
}

export function parseMonthParam(value: string | undefined): MonthView {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [yearPart, monthPart] = value.split("-");
    const year = Number(yearPart);
    const month = Number(monthPart) - 1;

    if (month >= 0 && month <= 11) {
      return { year, month };
    }
  }

  return getTodayMonthView();
}

/** רשת חודשית — שבוע מתחיל ביום ראשון */
export function getMonthCalendarDays(view: MonthView): MonthCalendarDay[] {
  const todayKey = toLocalDateKey(new Date());
  const firstOfMonth = new Date(view.year, view.month, 1);
  const lastOfMonth = new Date(view.year, view.month + 1, 0);

  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  const gridEnd = new Date(lastOfMonth);
  gridEnd.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

  const days: MonthCalendarDay[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const dateKey = toLocalDateKey(cursor);

    days.push({
      dateKey,
      dayNumber: cursor.getDate(),
      isCurrentMonth: cursor.getMonth() === view.month,
      isToday: dateKey === todayKey,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export { HEBREW_WEEKDAY_NAMES };
