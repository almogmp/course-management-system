export const EXPENSE_CATEGORIES = [
  "ציוד",
  "חומרים",
  "נסיעות",
  "תוכנה",
  "הדפסות",
  "אחר",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_PAID_BY_OPTIONS = ["אלמוג", "שימי"] as const;
export type ExpensePaidBy = (typeof EXPENSE_PAID_BY_OPTIONS)[number];

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value);
}

export function isExpensePaidBy(value: string): value is ExpensePaidBy {
  return (EXPENSE_PAID_BY_OPTIONS as readonly string[]).includes(value);
}

