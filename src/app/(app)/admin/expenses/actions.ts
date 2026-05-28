"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import {
  isExpenseCategory,
  isExpensePaidBy,
} from "@/lib/expenses/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

const EXPENSES_PATH = "/admin/expenses";

function redirectWithError(message: string, params?: URLSearchParams) {
  const base = params ? `${EXPENSES_PATH}?${params.toString()}` : EXPENSES_PATH;
  redirect(`${base}${base.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}

export async function createExpenseAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const paidBy = String(formData.get("paid_by") ?? "").trim();

  const month = String(formData.get("month") ?? "").trim();
  const params = new URLSearchParams();
  if (month) params.set("month", month);

  if (!expenseDate) redirectWithError("יש לבחור תאריך.", params);
  if (!description) redirectWithError("יש להזין תיאור.", params);

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) redirectWithError("סכום לא תקין.", params);

  if (!isExpenseCategory(category)) {
    redirectWithError("קטגוריה לא תקינה.", params);
  }
  if (!isExpensePaidBy(paidBy)) {
    redirectWithError("שדה 'מי שילם' לא תקין.", params);
  }

  const payload: ExpenseInsert = {
    expense_date: expenseDate,
    category,
    description,
    amount,
    paid_by: paidBy,
  };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("expenses").insert(payload);
  if (error) {
    redirectWithError(error.message, params);
  }

  revalidatePath(EXPENSES_PATH);
  redirect(`${EXPENSES_PATH}?${params.toString()}&success=created`);
}

export async function updateExpenseAction(expenseId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const paidBy = String(formData.get("paid_by") ?? "").trim();

  const month = String(formData.get("month") ?? "").trim();
  const params = new URLSearchParams();
  if (month) params.set("month", month);

  const amount = Number(amountRaw);
  if (!expenseDate) redirectWithError("יש לבחור תאריך.", params);
  if (!description) redirectWithError("יש להזין תיאור.", params);
  if (!Number.isFinite(amount) || amount < 0) redirectWithError("סכום לא תקין.", params);
  if (!isExpenseCategory(category)) redirectWithError("קטגוריה לא תקינה.", params);
  if (!isExpensePaidBy(paidBy)) redirectWithError("שדה 'מי שילם' לא תקין.", params);

  const payload: ExpenseUpdate = {
    expense_date: expenseDate,
    category,
    description,
    amount,
    paid_by: paidBy,
  };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("expenses").update(payload).eq("id", expenseId);
  if (error) {
    redirectWithError(error.message, params);
  }

  revalidatePath(EXPENSES_PATH);
  redirect(`${EXPENSES_PATH}?${params.toString()}&success=updated`);
}

export async function deleteExpenseAction(expenseId: string, month?: string): Promise<void> {
  await requireAdmin();

  const params = new URLSearchParams();
  if (month) params.set("month", month);

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
  if (error) {
    redirectWithError(error.message, params);
  }

  revalidatePath(EXPENSES_PATH);
  redirect(`${EXPENSES_PATH}?${params.toString()}&success=deleted`);
}

