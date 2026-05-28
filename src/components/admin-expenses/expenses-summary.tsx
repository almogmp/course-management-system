import type { ExpenseRow } from "@/lib/expenses/get-expenses";
import { EXPENSE_CATEGORIES, EXPENSE_PAID_BY_OPTIONS } from "@/lib/expenses/constants";
import { formatCurrency } from "@/lib/financial/format-currency";

type ExpensesSummaryProps = {
  rows: ExpenseRow[];
};

function sum(rows: ExpenseRow[], predicate: (row: ExpenseRow) => boolean): number {
  return rows.filter(predicate).reduce((acc, row) => acc + Number(row.amount), 0);
}

export function ExpensesSummary({ rows }: ExpensesSummaryProps) {
  const total = rows.reduce((acc, row) => acc + Number(row.amount), 0);
  const byPaidBy = Object.fromEntries(
    EXPENSE_PAID_BY_OPTIONS.map((payer) => [payer, sum(rows, (r) => r.paid_by === payer)]),
  ) as Record<(typeof EXPENSE_PAID_BY_OPTIONS)[number], number>;
  const byCategory = Object.fromEntries(
    EXPENSE_CATEGORIES.map((category) => [category, sum(rows, (r) => r.category === category)]),
  ) as Record<(typeof EXPENSE_CATEGORIES)[number], number>;

  return (
    <section className="space-y-3" aria-label="סיכום הוצאות">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-border bg-surface p-4 text-center">
          <h3 className="text-sm font-medium text-muted-foreground">סה״כ הוצאות</h3>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(total)}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-4 text-center">
          <h3 className="text-sm font-medium text-muted-foreground">סה״כ אלמוג</h3>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(byPaidBy["אלמוג"])}</p>
        </article>
        <article className="rounded-xl border border-border bg-surface p-4 text-center">
          <h3 className="text-sm font-medium text-muted-foreground">סה״כ שימי</h3>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(byPaidBy["שימי"])}</p>
        </article>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="app-table w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium text-muted-foreground">לפי קטגוריה</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">סה״כ</th>
            </tr>
          </thead>
          <tbody>
            {EXPENSE_CATEGORIES.map((category) => (
              <tr key={category} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 text-muted-foreground">{category}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatCurrency(byCategory[category])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

