import "server-only";

import { shouldSkipDateForBulkGeneration } from "@/lib/calendar/hebrew-calendar";
import { toLocalDateKey } from "@/lib/date/week";

export type BulkSessionCandidate = {
  sessionDate: string;
  startTime: string;
  endTime: string;
};

export type BulkGenerationInput = {
  startDate: string;
  endDate: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
};

export type BulkGenerationResult = {
  candidates: BulkSessionCandidate[];
  skippedHolidayCount: number;
};

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

function timeToMinutes(time: string): number {
  const normalized = time.slice(0, 5);
  const [hours, minutes] = normalized.split(":").map(Number);

  return hours * 60 + minutes;
}

export function validateBulkGenerationInput(input: BulkGenerationInput): string | null {
  if (!input.startDate || !input.endDate) {
    return "יש לבחור תאריך התחלה ותאריך סיום.";
  }

  if (input.weekdays.length === 0) {
    return "יש לבחור לפחות יום אחד בשבוע.";
  }

  if (!input.startTime || !input.endTime) {
    return "יש לבחור שעת התחלה ושעת סיום.";
  }

  if (timeToMinutes(input.endTime) <= timeToMinutes(input.startTime)) {
    return "שעת הסיום חייבת להיות אחרי שעת ההתחלה.";
  }

  const start = parseDateKey(input.startDate);
  const end = parseDateKey(input.endDate);

  if (end < start) {
    return "תאריך הסיום חייב להיות אחרי תאריך ההתחלה.";
  }

  return null;
}

/** All session dates matching weekdays between start and end (inclusive). */
export function generateBulkSessionCandidates(input: BulkGenerationInput): BulkGenerationResult {
  const weekdaySet = new Set(input.weekdays);
  const candidates: BulkSessionCandidate[] = [];
  let skippedHolidayCount = 0;

  const cursor = parseDateKey(input.startDate);
  const end = parseDateKey(input.endDate);

  while (cursor <= end) {
    const dateKey = toLocalDateKey(cursor);

    if (weekdaySet.has(cursor.getDay())) {
      if (shouldSkipDateForBulkGeneration()) {
        skippedHolidayCount += 1;
      } else {
        candidates.push({
          sessionDate: dateKey,
          startTime: input.startTime.slice(0, 5),
          endTime: input.endTime.slice(0, 5),
        });
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return { candidates, skippedHolidayCount };
}

export function sessionOccurrenceKey(sessionDate: string, startTime: string): string {
  return `${sessionDate}|${startTime.slice(0, 5)}`;
}

export function partitionBulkCandidates(
  candidates: BulkSessionCandidate[],
  existingKeys: Set<string>,
): { toCreate: BulkSessionCandidate[]; skippedDuplicateCount: number } {
  const toCreate: BulkSessionCandidate[] = [];
  let skippedDuplicateCount = 0;

  for (const candidate of candidates) {
    const key = sessionOccurrenceKey(candidate.sessionDate, candidate.startTime);

    if (existingKeys.has(key)) {
      skippedDuplicateCount += 1;
    } else {
      toCreate.push(candidate);
    }
  }

  return { toCreate, skippedDuplicateCount };
}
