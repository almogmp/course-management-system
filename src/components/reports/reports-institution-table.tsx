import { formatSessionHours } from "@/components/sessions/format";
import { formatCurrency } from "@/lib/financial/format-currency";
import type { PartnerReportEntityRow } from "@/lib/reports/partner-report-types";

type ReportsInstitutionTableProps = {
  rows: PartnerReportEntityRow[];
};

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}

const moneyColumns = [
  { key: "grossRevenue" as const, label: "תקבול ברוטו" },
  { key: "vat" as const, label: "מע״מ" },
  { key: "instructorCost" as const, label: "עלות מדריכים" },
  { key: "grossProfit" as const, label: "רווח גולמי" },
];

export function ReportsInstitutionTable({ rows }: ReportsInstitutionTableProps) {
  if (rows.length === 0) {
    return <EmptyState message="אין מפגשים שבוצעו בטווח התאריכים שנבחר." />;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">דוח לפי מוסד</h2>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-xl border border-border bg-surface p-4 text-center"
          >
            <p className="font-semibold text-foreground">{row.name}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">מפגשים שבוצעו</dt>
                <dd className="font-medium">{row.completedSessionCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">סה״כ שעות</dt>
                <dd className="font-medium">{formatSessionHours(row.totalHours)}</dd>
              </div>
              {moneyColumns.map((col) => (
                <div key={col.key}>
                  <dt className="text-muted-foreground">{col.label}</dt>
                  <dd className="font-medium">{formatCurrency(row[col.key])}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="app-table w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium text-muted-foreground">מוסד</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">מפגשים שבוצעו</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">סה״כ שעות</th>
              {moneyColumns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium text-muted-foreground">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.completedSessionCount}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatSessionHours(row.totalHours)}
                </td>
                {moneyColumns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-muted-foreground">
                    {formatCurrency(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
