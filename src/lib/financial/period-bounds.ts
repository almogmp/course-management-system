import { toLocalDateKey } from "@/lib/date/week";

function parseLocalDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayDateKey(): string {
  return toLocalDateKey(new Date());
}

export function getWeekBoundsForDate(dateKey: string): { startDate: string; endDate: string } {
  const date = parseLocalDate(dateKey);
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    startDate: toLocalDateKey(start),
    endDate: toLocalDateKey(end),
  };
}

export function isDateInRange(
  dateKey: string,
  startDate: string,
  endDate: string,
): boolean {
  return dateKey >= startDate && dateKey <= endDate;
}
