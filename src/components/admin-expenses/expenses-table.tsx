"use client";

import { useState } from "react";

import { deleteExpenseAction, updateExpenseAction } from "@/app/(app)/admin/expenses/actions";
import { Button } from "@/components/ui/button";
import type { ExpenseRow } from "@/lib/expenses/get-expenses";
import type { ExpenseDateRange } from "@/lib/expenses/date-range";
import { EXPENSE_CATEGORIES, EXPENSE_PAID_BY_OPTIONS } from "@/lib/expenses/constants";
import { formatCurrency } from "@/lib/financial/format-currency";
import { cn } from "@/lib/utils";

type ExpensesTableProps = {
  rows: ExpenseRow[];
  range: ExpenseDateRange;
  rangeLabel: string;
  paidBy?: string;
  category?: string;
};

const inputClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

export function ExpensesTable({ rows, range, rangeLabel, paidBy, category }: ExpensesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
        אין הוצאות בטווח התאריכים {rangeLabel}.
        {paidBy || category ? (
          <>
            <br />
            ייתכן שהסינון (מי שילם / קטגוריה) מצמצם את התוצאות — נסו לנקות סינון או להרחיב את טווח
            התאריכים.
          </>
        ) : (
          <>
            <br />
            הוסיפו הוצאה עם תאריך בין {range.from} ל־{range.to}, או הרחיבו את טווח הסינון.
          </>
        )}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="app-table w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 font-medium text-muted-foreground">תאריך</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">קטגוריה</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">תיאור</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">סכום</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">מי שילם</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isEditing = editingId === row.id;
            const boundUpdate = updateExpenseAction.bind(null, row.id);

            return (
              <tr
                key={row.id}
                className={cn("border-b border-border last:border-b-0", isEditing && "bg-muted/10")}
              >
                {isEditing ? (
                  <td colSpan={6} className="px-4 py-3">
                    <form action={boundUpdate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                      <input type="hidden" name="filter_from" value={range.from} />
                      <input type="hidden" name="filter_to" value={range.to} />
                      {paidBy ? <input type="hidden" name="filter_paidBy" value={paidBy} /> : null}
                      {category ? (
                        <input type="hidden" name="filter_category" value={category} />
                      ) : null}
                      <input
                        name="expense_date"
                        type="date"
                        defaultValue={row.expense_date}
                        required
                        dir="ltr"
                        className={inputClassName}
                      />
                      <select name="category" defaultValue={row.category} required className={inputClassName}>
                        {EXPENSE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        name="description"
                        type="text"
                        defaultValue={row.description}
                        required
                        className={inputClassName}
                      />
                      <input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={String(row.amount)}
                        required
                        dir="ltr"
                        className={inputClassName}
                      />
                      <select name="paid_by" defaultValue={row.paid_by} required className={inputClassName}>
                        {EXPENSE_PAID_BY_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button type="submit" size="sm">
                          שמור
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          ביטול
                        </Button>
                      </div>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-foreground">{row.expense_date}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.description}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.paid_by}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingId(row.id)}
                        >
                          ערוך
                        </Button>
                        <form
                          action={async (formData) => {
                            await deleteExpenseAction(row.id, formData);
                          }}
                        >
                          <input type="hidden" name="filter_from" value={range.from} />
                          <input type="hidden" name="filter_to" value={range.to} />
                          {paidBy ? (
                            <input type="hidden" name="filter_paidBy" value={paidBy} />
                          ) : null}
                          {category ? (
                            <input type="hidden" name="filter_category" value={category} />
                          ) : null}
                          <Button type="submit" variant="ghost" size="sm">
                            מחק
                          </Button>
                        </form>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
