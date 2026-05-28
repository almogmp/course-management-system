import { getMonthBounds } from "@/lib/dashboard/month-bounds";
import { parseMonthParam, type MonthView } from "@/components/calendar/month-calendar-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { ExpenseCategory, ExpensePaidBy } from "@/lib/expenses/constants";

export type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];

export type ExpensesFilters = {
  month?: string;
  paidBy?: ExpensePaidBy;
  category?: ExpenseCategory;
};

export type ExpensesPageData = {
  monthView: MonthView;
  monthLabel: string;
  monthParam: string;
  rows: ExpenseRow[];
};

export async function getExpensesPageData(filters: ExpensesFilters): Promise<ExpensesPageData> {
  const monthView = parseMonthParam(filters.month);
  const { startDate, endDate } = getMonthBounds(monthView);
  const monthLabel = new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric" }).format(
    new Date(`${startDate}T12:00:00`),
  );
  const monthParam = `${monthView.year}-${String(monthView.month).padStart(2, "0")}`;

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("expenses")
    .select("id, expense_date, category, description, amount, paid_by, created_at, updated_at")
    .gte("expense_date", startDate)
    .lte("expense_date", endDate)
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
    monthView,
    monthLabel,
    monthParam,
    rows: (data ?? []) as ExpenseRow[],
  };
}

