import Link from "next/link";

import { createExpenseAction } from "@/app/(app)/admin/expenses/actions";
import { ExpensesSummary } from "@/components/admin-expenses/expenses-summary";
import { ExpensesTable } from "@/components/admin-expenses/expenses-table";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/guards";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_PAID_BY_OPTIONS,
  isExpenseCategory,
  isExpensePaidBy,
} from "@/lib/expenses/constants";
import { getExpensesPageData } from "@/lib/expenses/get-expenses";

type AdminExpensesPageProps = {
  searchParams?: {
    from?: string;
    to?: string;
    paidBy?: string;
    category?: string;
    success?: string;
    error?: string;
  };
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

export default async function AdminExpensesPage({ searchParams }: AdminExpensesPageProps) {
  await requireAdmin();

  const paidByRaw = String(searchParams?.paidBy ?? "").trim();
  const categoryRaw = String(searchParams?.category ?? "").trim();
  const paidBy = paidByRaw && isExpensePaidBy(paidByRaw) ? paidByRaw : undefined;
  const category = categoryRaw && isExpenseCategory(categoryRaw) ? categoryRaw : undefined;

  const page = await getExpensesPageData({
    from: searchParams?.from,
    to: searchParams?.to,
    paidBy,
    category,
  });

  const successMessage =
    searchParams?.success === "created"
      ? "ההוצאה נוספה בהצלחה."
      : searchParams?.success === "updated"
        ? "ההוצאה עודכנה בהצלחה."
        : searchParams?.success === "deleted"
          ? "ההוצאה נמחקה."
          : null;

  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-start">
        <Link
          href="/dashboard"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          חזרה לדשבורד
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">הוצאות</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          מודול הוצאות נפרד — לא מקוזז מדוחות כספיים/רווח/שכר.
        </p>
      </header>

      {successMessage ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <section className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <form method="get" className="contents">
          <div className="space-y-2">
            <label htmlFor="expenses-from" className="block text-sm font-medium text-foreground">
              תאריך התחלה
            </label>
            <input
              id="expenses-from"
              name="from"
              type="date"
              defaultValue={page.range.from}
              dir="ltr"
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="expenses-to" className="block text-sm font-medium text-foreground">
              תאריך סיום
            </label>
            <input
              id="expenses-to"
              name="to"
              type="date"
              defaultValue={page.range.to}
              dir="ltr"
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="expenses-paidby" className="block text-sm font-medium text-foreground">
              מי שילם
            </label>
            <select
              id="expenses-paidby"
              name="paidBy"
              defaultValue={paidBy ?? ""}
              className={inputClassName}
            >
              <option value="">הכל</option>
              {EXPENSE_PAID_BY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="expenses-category" className="block text-sm font-medium text-foreground">
              קטגוריה
            </label>
            <select
              id="expenses-category"
              name="category"
              defaultValue={category ?? ""}
              className={inputClassName}
            >
              <option value="">הכל</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="w-full">
              סינון
            </Button>
            <Link
              href="/admin/expenses"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              ניקוי
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">הוספת הוצאה</h2>
        <form action={createExpenseAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <input type="hidden" name="filter_from" value={page.range.from} />
          <input type="hidden" name="filter_to" value={page.range.to} />
          {paidBy ? <input type="hidden" name="filter_paidBy" value={paidBy} /> : null}
          {category ? <input type="hidden" name="filter_category" value={category} /> : null}
          <div className="space-y-2">
            <label htmlFor="expense-date" className="block text-sm font-medium text-foreground">
              תאריך
            </label>
            <input
              id="expense-date"
              name="expense_date"
              type="date"
              required
              defaultValue={page.range.to}
              dir="ltr"
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="expense-category" className="block text-sm font-medium text-foreground">
              קטגוריה
            </label>
            <select id="expense-category" name="category" required className={inputClassName}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label htmlFor="expense-description" className="block text-sm font-medium text-foreground">
              תיאור
            </label>
            <input id="expense-description" name="description" type="text" required className={inputClassName} />
          </div>
          <div className="space-y-2">
            <label htmlFor="expense-amount" className="block text-sm font-medium text-foreground">
              סכום
            </label>
            <input
              id="expense-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              dir="ltr"
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="expense-paidby" className="block text-sm font-medium text-foreground">
              מי שילם
            </label>
            <select id="expense-paidby" name="paid_by" required className={inputClassName}>
              {EXPENSE_PAID_BY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-5">
            <Button type="submit" className="w-full sm:w-auto">
              הוסף הוצאה
            </Button>
          </div>
        </form>
      </section>

      <ExpensesSummary rows={page.rows} rangeLabel={page.rangeLabel} />
      <ExpensesTable
        rows={page.rows}
        range={page.range}
        paidBy={paidBy}
        category={category}
        rangeLabel={page.rangeLabel}
      />
    </Container>
  );
}
