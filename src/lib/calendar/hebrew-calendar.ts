import "server-only";

import { HDate, HebrewCalendar, Event } from "@hebcal/core";

export type HebrewDayInfo = {
  hebrewDateLabel: string;
  holidays: string[];
};

const holidayCache = new Map<string, Map<string, string[]>>();

function cacheKeyForRange(startDate: string, endDate: string): string {
  return `${startDate}:${endDate}`;
}

function normalizeTimeForKey(time: string): string {
  return time.slice(0, 5);
}

/** Gregorian YYYY-MM-DD → Hebrew label e.g. כ׳ אלול תשפ״ו */
export function formatHebrewDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const hd = new HDate(new Date(year, month - 1, day));

  return hd.render("he");
}

function buildHolidayMap(startDate: string, endDate: string): Map<string, string[]> {
  const cached = holidayCache.get(cacheKeyForRange(startDate, endDate));

  if (cached) {
    return cached;
  }

  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const map = new Map<string, string[]>();

  const events = HebrewCalendar.calendar({
    start,
    end,
    il: true,
    candlelighting: false,
    sedrot: false,
    omer: false,
  });

  for (const ev of events) {
    if (!(ev instanceof Event)) {
      continue;
    }

    const desc = ev.render("he");

    if (!desc) {
      continue;
    }

    const greg = ev.getDate().greg();
    const dateKey = `${greg.getFullYear()}-${String(greg.getMonth() + 1).padStart(2, "0")}-${String(greg.getDate()).padStart(2, "0")}`;
    const existing = map.get(dateKey) ?? [];

    if (!existing.includes(desc)) {
      existing.push(desc);
      map.set(dateKey, existing);
    }
  }

  holidayCache.set(cacheKeyForRange(startDate, endDate), map);

  return map;
}

export function getHebrewDayInfo(dateKey: string, range?: { start: string; end: string }): HebrewDayInfo {
  const hebrewDateLabel = formatHebrewDateLabel(dateKey);

  if (!range) {
    return { hebrewDateLabel, holidays: [] };
  }

  const holidayMap = buildHolidayMap(range.start, range.end);

  return {
    hebrewDateLabel,
    holidays: holidayMap.get(dateKey) ?? [],
  };
}

export function enrichDateKeysWithHebrew(
  dateKeys: string[],
): Record<string, HebrewDayInfo> {
  if (dateKeys.length === 0) {
    return {};
  }

  const sorted = [...dateKeys].sort();
  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  const holidayMap = buildHolidayMap(start, end);
  const result: Record<string, HebrewDayInfo> = {};

  for (const dateKey of dateKeys) {
    result[dateKey] = {
      hebrewDateLabel: formatHebrewDateLabel(dateKey),
      holidays: holidayMap.get(dateKey) ?? [],
    };
  }

  return result;
}

/** Future: skip Israeli holidays / Ministry of Education breaks in bulk generation */
export function shouldSkipDateForBulkGeneration(): boolean {
  return false;
}

export function enrichWeekDays<T extends { dateKey: string }>(
  days: T[],
): Array<T & HebrewDayInfo> {
  const info = enrichDateKeysWithHebrew(days.map((day) => day.dateKey));

  return days.map((day) => ({
    ...day,
    ...info[day.dateKey],
  }));
}

export { normalizeTimeForKey };
