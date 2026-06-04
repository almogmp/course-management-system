import { toLocalDateKey } from "@/lib/date/week";
import type { PartnerReportDateRange } from "@/lib/reports/partner-report-types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();

  if (trimmed && ISO_DATE.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}

/** Default: current calendar month (local). */
export function getDefaultReportDateRange(): PartnerReportDateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    from: toLocalDateKey(start),
    to: toLocalDateKey(end),
  };
}

export function parseReportDateRange(
  fromParam?: string,
  toParam?: string,
): PartnerReportDateRange {
  const defaults = getDefaultReportDateRange();
  let from = parseIsoDate(fromParam, defaults.from);
  let to = parseIsoDate(toParam, defaults.to);

  if (from > to) {
    [from, to] = [to, from];
  }

  return { from, to };
}

export function formatReportRangeLabel(range: PartnerReportDateRange): string {
  const fromLabel = new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${range.from}T12:00:00`));

  const toLabel = new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${range.to}T12:00:00`));

  return `${fromLabel} – ${toLabel}`;
}
