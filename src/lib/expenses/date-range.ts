import { toLocalDateKey } from "@/lib/date/week";

export type ExpenseDateRange = {
  from: string;
  to: string;
};

/** Default: first and last day of current calendar month (local). */
export function getDefaultExpenseDateRange(): ExpenseDateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    from: toLocalDateKey(start),
    to: toLocalDateKey(end),
  };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();

  if (trimmed && ISO_DATE.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}

export function parseExpenseDateRange(
  fromParam?: string,
  toParam?: string,
): ExpenseDateRange {
  const defaults = getDefaultExpenseDateRange();
  let from = parseIsoDate(fromParam, defaults.from);
  let to = parseIsoDate(toParam, defaults.to);

  if (from > to) {
    [from, to] = [to, from];
  }

  return { from, to };
}

export function formatExpenseRangeLabel(range: ExpenseDateRange): string {
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

export function buildExpenseFilterSearchParams(input: {
  from: string;
  to: string;
  paidBy?: string;
  category?: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  params.set("from", input.from);
  params.set("to", input.to);

  if (input.paidBy) {
    params.set("paidBy", input.paidBy);
  }

  if (input.category) {
    params.set("category", input.category);
  }

  return params;
}
