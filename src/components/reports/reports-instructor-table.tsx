import { formatSessionHours } from "@/components/sessions/format";
import { formatCurrency } from "@/lib/financial/format-currency";
import type { InstructorReportRow } from "@/lib/reports/types";

type ReportsInstructorTableProps = {
  rows: InstructorReportRow[];
};

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}

export function ReportsInstructorTable({ rows }: ReportsInstructorTableProps) {
  if (rows.length === 0) {
    return <EmptyState message="אין נתוני מדריכים לחודש הנבחר." />;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">דוח לפי מדריך</h2>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={row.instructorId}
            className="rounded-xl border border-border bg-surface p-4 text-center"
          >
            <p className="font-semibold text-foreground">{row.instructorName}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">כמות מפגשים</dt>
                <dd className="font-medium">{row.sessionCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">בוצעו</dt>
                <dd className="font-medium">{row.completedCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">בוטלו</dt>
                <dd className="font-medium">{row.cancelledCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">ממתינים לאישור</dt>
                <dd className="font-medium">{row.pendingApprovalCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">שעות מדריך</dt>
                <dd className="font-medium">{formatSessionHours(row.instructorHours)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">שכר בפועל</dt>
                <dd className="font-medium">{formatCurrency(row.actualInstructorPayout)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">שכר פוטנציאלי</dt>
                <dd className="font-medium">{formatCurrency(row.potentialInstructorPayout)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="app-table w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium text-muted-foreground">מדריך</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">כמות מפגשים</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">בוצעו</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">בוטלו</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">ממתינים לאישור</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">שעות מדריך</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">שכר בפועל</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">שכר פוטנציאלי</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.instructorId} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{row.instructorName}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.sessionCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.completedCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.cancelledCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.pendingApprovalCount}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatSessionHours(row.instructorHours)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCurrency(row.actualInstructorPayout)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCurrency(row.potentialInstructorPayout)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
