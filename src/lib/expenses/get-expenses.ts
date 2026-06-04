import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { ExpenseCategory, ExpensePaidBy } from "@/lib/expenses/constants";
import {
  formatExpenseRangeLabel,
  getDefaultExpenseDateRange,
  parseExpenseDateRange,
  type ExpenseDateRange,
} from "@/lib/expenses/date-range";

export type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];

export type ExpensesFilters = {
  from?: string;
  to?: string;
  paidBy?: ExpensePaidBy;
  category?: ExpenseCategory;
};

export type ExpensesPageData = {
  range: ExpenseDateRange;
  rangeLabel: string;
  rows: ExpenseRow[];
};

export async function getExpensesPageData(filters: ExpensesFilters): Promise<ExpensesPageData> {
  const range = parseExpenseDateRange(filters.from, filters.to);
  const rangeLabel = formatExpenseRangeLabel(range);

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("expenses")
    .select("id, expense_date, category, description, amount, paid_by, created_at, updated_at")
    .gte("expense_date", range.from)
    .lte("expense_date", range.to)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.paidBy) {
    query = query.eq("paid_by", filters.paidBy);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    range,
    rangeLabel,
    rows: (data ?? []) as ExpenseRow[],
  };
}

export { getDefaultExpenseDateRange };
