import { formatSessionHours } from "@/components/sessions/format";
import { formatCurrency } from "@/lib/financial/format-currency";
import type { PayrollSummaryRow } from "@/lib/financial/get-payroll-summary";

type PayrollSummaryTableProps = {
  rows: PayrollSummaryRow[];
};

export function PayrollSummaryTable({ rows }: PayrollSummaryTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
        אין נתונים בטווח התאריכים שנבחר.
      </p>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">סיכום לפי מדריך</h2>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="app-table w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium text-muted-foreground">מדריך</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">מספר מפגשים</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">שעות מדריך</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">שכר בפועל</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">שכר פוטנציאלי</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">מפגשים שבוטלו</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">ממתינים לאישור</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.instructorId} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{row.instructorName}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.sessionCount}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatSessionHours(row.instructorHours)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCurrency(row.actualPayout)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCurrency(row.potentialPayout)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{row.cancelledCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.pendingApprovalCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
