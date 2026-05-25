import { formatSessionStatusLabel } from "@/lib/admin-reports/filters";
import type { AdminReportSessionRow } from "@/lib/admin-reports/types";
import {
  formatSessionDate,
  formatSessionHoursDisplay,
  formatSessionTimeRange,
} from "@/components/sessions/format";
import { formatCurrency } from "@/lib/financial/format-currency";
import {
  APP_TABLE_CLASS,
  APP_TABLE_NOTES_CLASS,
  APP_TABLE_TD_CLASS,
  APP_TABLE_TH_CLASS,
} from "@/components/ui/table-classes";

type AdminReportsTableProps = {
  rows: AdminReportSessionRow[];
};

function formatRate(amount: number): string {
  return amount > 0 ? formatCurrency(amount) : "—";
}

function formatMoney(amount: number): string {
  return formatCurrency(amount);
}

export function AdminReportsTable({ rows }: AdminReportsTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
        לא נמצאו נתונים בטווח ובסינון שנבחרו
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className={`${APP_TABLE_CLASS} min-w-[1400px]`}>
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className={APP_TABLE_TH_CLASS}>תאריך</th>
            <th className={APP_TABLE_TH_CLASS}>שעה</th>
            <th className={APP_TABLE_TH_CLASS}>ספק</th>
            <th className={APP_TABLE_TH_CLASS}>מוסד</th>
            <th className={APP_TABLE_TH_CLASS}>קורס</th>
            <th className={APP_TABLE_TH_CLASS}>מדריך</th>
            <th className={APP_TABLE_TH_CLASS}>שעות מדריך</th>
            <th className={APP_TABLE_TH_CLASS}>שעות חברה</th>
            <th className={APP_TABLE_TH_CLASS}>מחיר מוסד לשעה</th>
            <th className={APP_TABLE_TH_CLASS}>שכר מדריך לשעה</th>
            <th className={APP_TABLE_TH_CLASS}>הכנסה</th>
            <th className={APP_TABLE_TH_CLASS}>שכר מדריך</th>
            <th className={APP_TABLE_TH_CLASS}>רווח</th>
            <th className={APP_TABLE_TH_CLASS}>סטטוס</th>
            <th className={APP_TABLE_TH_CLASS}>הערות</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-b-0">
              <td className={`${APP_TABLE_TD_CLASS} text-foreground`}>
                {formatSessionDate(row.sessionDate)}
              </td>
              <td className={APP_TABLE_TD_CLASS} dir="ltr">
                {formatSessionTimeRange(row.startTime, row.endTime)}
              </td>
              <td className={APP_TABLE_TD_CLASS}>{row.supplierName}</td>
              <td className={APP_TABLE_TD_CLASS}>{row.institutionName}</td>
              <td className={`${APP_TABLE_TD_CLASS} text-foreground`}>{row.courseName}</td>
              <td className={APP_TABLE_TD_CLASS}>{row.instructorName}</td>
              <td className={APP_TABLE_TD_CLASS}>
                {formatSessionHoursDisplay(row.instructorHours)}
              </td>
              <td className={APP_TABLE_TD_CLASS}>
                {formatSessionHoursDisplay(row.companyHours)}
              </td>
              <td className={APP_TABLE_TD_CLASS}>{formatRate(row.institutionHourlyRate)}</td>
              <td className={APP_TABLE_TD_CLASS}>{formatRate(row.instructorHourlyRate)}</td>
              <td className={APP_TABLE_TD_CLASS}>{formatMoney(row.revenue)}</td>
              <td className={APP_TABLE_TD_CLASS}>{formatMoney(row.instructorPayout)}</td>
              <td className={APP_TABLE_TD_CLASS}>{formatMoney(row.profit)}</td>
              <td className={APP_TABLE_TD_CLASS}>{formatSessionStatusLabel(row.status)}</td>
              <td className={APP_TABLE_NOTES_CLASS}>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
