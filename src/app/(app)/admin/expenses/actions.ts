"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import {
  isExpenseCategory,
  isExpensePaidBy,
} from "@/lib/expenses/constants";
import { buildExpenseFilterSearchParams, parseExpenseDateRange } from "@/lib/expenses/date-range";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

const EXPENSES_PATH = "/admin/expenses";

function filterParamsFromForm(formData: FormData): URLSearchParams {
  const from = String(formData.get("filter_from") ?? "").trim();
  const to = String(formData.get("filter_to") ?? "").trim();
  const paidBy = String(formData.get("filter_paidBy") ?? "").trim();
  const category = String(formData.get("filter_category") ?? "").trim();
  const range = parseExpenseDateRange(from || undefined, to || undefined);

  return buildExpenseFilterSearchParams({
    from: range.from,
    to: range.to,
    paidBy: paidBy && isExpensePaidBy(paidBy) ? paidBy : undefined,
    category: category && isExpenseCategory(category) ? category : undefined,
  });
}

function redirectWithError(message: string, params: URLSearchParams) {
  params.set("error", message);
  redirect(`${EXPENSES_PATH}?${params.toString()}`);
}

export async function createExpenseAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const paidBy = String(formData.get("paid_by") ?? "").trim();

  const params = filterParamsFromForm(formData);

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

  const redirectParams = filterParamsFromForm(formData);
  redirectParams.set("success", "created");

  revalidatePath(EXPENSES_PATH);
  redirect(`${EXPENSES_PATH}?${redirectParams.toString()}`);
}

export async function updateExpenseAction(expenseId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const paidBy = String(formData.get("paid_by") ?? "").trim();

  const params = filterParamsFromForm(formData);

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

  const redirectParams = filterParamsFromForm(formData);
  redirectParams.set("success", "updated");

  revalidatePath(EXPENSES_PATH);
  redirect(`${EXPENSES_PATH}?${redirectParams.toString()}`);
}

export async function deleteExpenseAction(expenseId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const params = filterParamsFromForm(formData);

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);

  if (error) {
    redirectWithError(error.message, params);
  }

  params.set("success", "deleted");

  revalidatePath(EXPENSES_PATH);
  redirect(`${EXPENSES_PATH}?${params.toString()}`);
}
