"use client";

import { useState } from "react";

import { deleteExpenseAction, updateExpenseAction } from "@/app/(app)/admin/expenses/actions";
import { Button } from "@/components/ui/button";
import type { ExpenseRow } from "@/lib/expenses/get-expenses";
import { EXPENSE_CATEGORIES, EXPENSE_PAID_BY_OPTIONS } from "@/lib/expenses/constants";
import { formatCurrency } from "@/lib/financial/format-currency";
import { cn } from "@/lib/utils";

type ExpensesTableProps = {
  rows: ExpenseRow[];
  monthParam: string;
};

const inputClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

export function ExpensesTable({ rows, monthParam }: ExpensesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
        אין הוצאות בחודש שנבחר
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
            return (
              <tr key={row.id} className={cn("border-b border-border last:border-b-0", isEditing && "bg-muted/10")}>
                {isEditing ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        name="expense_date"
                        type="date"
                        defaultValue={row.expense_date}
                        className={inputClassName}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select name="category" defaultValue={row.category} className={inputClassName}>
                        {EXPENSE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input name="description" type="text" defaultValue={row.description} className={inputClassName} />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={String(row.amount)}
                        className={inputClassName}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select name="paid_by" defaultValue={row.paid_by} className={inputClassName}>
                        {EXPENSE_PAID_BY_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <form
                        action={async (formData) => {
                          formData.set("month", monthParam);
                          await updateExpenseAction(row.id, formData);
                        }}
                        className="flex flex-wrap justify-center gap-2"
                      >
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
                      </form>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-foreground">{row.expense_date}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.description}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.paid_by}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button type="button" variant="secondary" size="sm" onClick={() => setEditingId(row.id)}>
                          ערוך
                        </Button>
                        <form action={async () => deleteExpenseAction(row.id, monthParam)}>
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

