import { formatSessionDate, formatSessionHours } from "@/components/sessions/format";
import { formatCurrency } from "@/lib/financial/format-currency";
import { formatRateSource } from "@/lib/reports/format-rate-source";
import type { FinancialAuditSessionRow } from "@/lib/reports/build-financial-audit-report";
import { cn } from "@/lib/utils";

type ReportsFinancialAuditTableProps = {
  rows: FinancialAuditSessionRow[];
};

function RateSourceCell({
  source,
  rate,
  missing,
}: {
  source: FinancialAuditSessionRow["companyRateSource"];
  rate: number;
  missing: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <span
        className={cn(
          "inline-flex rounded border px-1.5 py-0.5 text-xs font-medium",
          missing
            ? "border-amber-400 bg-amber-50 text-amber-950"
            : "border-border bg-muted/40 text-foreground",
        )}
      >
        {formatRateSource(source)}
      </span>
      <p className="text-xs text-muted-foreground" dir="ltr">
        {formatCurrency(rate)}/שעה
      </p>
    </div>
  );
}

function MoneyCell({ value, emphasize }: { value: number; emphasize?: boolean }) {
  return (
    <span className={cn(emphasize && value === 0 ? "text-amber-700" : undefined)}>
      {formatCurrency(value)}
    </span>
  );
}

export function ReportsFinancialAuditTable({ rows }: ReportsFinancialAuditTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        אין מפגשים שבוצעו בטווח התאריכים שנבחר.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="app-table w-full min-w-[1400px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-3 font-medium text-muted-foreground">מזהה מפגש</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">קורס</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">מוסד</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">תאריך</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">שעות חברה</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">שעות מדריך</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">מקור תעריף חברה</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">מקור תעריף מדריך</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">תקבול ברוטו</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">עלות מדריך</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">מע״מ</th>
            <th className="px-3 py-3 font-medium text-muted-foreground">רווח גולמי</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const hasHoursWithoutRevenue =
              row.companyHours > 0 && row.grossRevenue === 0 && row.missingCompanyRate;

            return (
              <tr
                key={row.sessionId}
                className={cn(
                  "border-b border-border last:border-b-0",
                  hasHoursWithoutRevenue && "bg-amber-50/60",
                )}
              >
                <td
                  className="px-3 py-3 font-mono text-xs text-muted-foreground"
                  dir="ltr"
                  title={row.sessionId}
                >
                  {row.sessionId}
                </td>
                <td className="px-3 py-3 text-foreground">{row.courseName}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.institutionName}</td>
                <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                  {formatSessionDate(row.sessionDate)}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {formatSessionHours(row.companyHours)}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {formatSessionHours(row.instructorHours)}
                </td>
                <td className="px-3 py-3">
                  <RateSourceCell
                    source={row.companyRateSource}
                    rate={row.companyRate}
                    missing={row.missingCompanyRate}
                  />
                </td>
                <td className="px-3 py-3">
                  <RateSourceCell
                    source={row.instructorRateSource}
                    rate={row.instructorRate}
                    missing={row.missingInstructorRate}
                  />
                </td>
                <td className="px-3 py-3">
                  <MoneyCell value={row.grossRevenue} emphasize />
                </td>
                <td className="px-3 py-3">
                  <MoneyCell value={row.instructorCost} />
                </td>
                <td className="px-3 py-3">
                  <MoneyCell value={row.vat} />
                </td>
                <td className="px-3 py-3">
                  <MoneyCell value={row.grossProfit} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
