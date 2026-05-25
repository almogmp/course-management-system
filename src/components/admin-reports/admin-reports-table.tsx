import { formatSessionStatusLabel } from "@/lib/admin-reports/filters";
import { resolveAdminReportKind } from "@/lib/admin-reports/report-type";
import type { AdminReportData, AdminReportSessionRow } from "@/lib/admin-reports/types";
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
  report: AdminReportData;
  variant?: "screen" | "print";
};

function formatRate(amount: number): string {
  return amount > 0 ? formatCurrency(amount) : "—";
}

function formatMoney(amount: number): string {
  return formatCurrency(amount);
}

function FinancialCells({ row }: { row: AdminReportSessionRow }) {
  const { financials: f } = row;
  return (
    <>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(f.grossRevenue)}</td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(f.vatAmount)}</td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(f.netRevenueBeforeInstructor)}</td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(f.instructorPayout)}</td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(f.grossProfit)}</td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(f.netProfit)}</td>
    </>
  );
}

function FinancialHeaders() {
  return (
    <>
      <th className={APP_TABLE_TH_CLASS}>תקבול ברוטו</th>
      <th className={APP_TABLE_TH_CLASS}>מע״מ</th>
      <th className={APP_TABLE_TH_CLASS}>תקבול נטו לפני מדריך</th>
      <th className={APP_TABLE_TH_CLASS}>שכר מדריך</th>
      <th className={APP_TABLE_TH_CLASS}>רווח ברוטו</th>
      <th className={APP_TABLE_TH_CLASS}>רווח נקי</th>
    </>
  );
}

function TotalsRow({
  report,
  colSpan,
}: {
  report: AdminReportData;
  colSpan: number;
}) {
  const { summary, filters } = report;
  const kind = resolveAdminReportKind(filters);

  if (kind === "instructor") {
    return (
      <tr className="report-print-totals border-t-2 border-border bg-muted/40">
        <td colSpan={colSpan} className={`${APP_TABLE_TD_CLASS} font-semibold text-foreground`}>
          סה״כ לתשלום למדריך: {formatMoney(summary.totalInstructorPayout)}
        </td>
      </tr>
    );
  }

  return (
    <tr className="report-print-totals border-t-2 border-border bg-muted/40">
      <td colSpan={colSpan} className={`${APP_TABLE_TD_CLASS} font-semibold text-foreground`}>
        סיכום
      </td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(summary.totalGrossRevenue)}</td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(summary.totalVat)}</td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(summary.totalNetRevenue)}</td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(summary.totalInstructorPayout)}</td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(summary.totalGrossProfit)}</td>
      <td className={APP_TABLE_TD_CLASS}>{formatMoney(summary.totalNetProfit)}</td>
      <td className={APP_TABLE_TD_CLASS} colSpan={2} />
    </tr>
  );
}

export function AdminReportsTable({ report, variant = "screen" }: AdminReportsTableProps) {
  const { rows, filters } = report;
  const kind = resolveAdminReportKind(filters);
  const wrapperClass =
    variant === "print"
      ? "report-print-table-wrap"
      : "overflow-x-auto rounded-xl border border-border bg-surface";

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
        לא נמצאו נתונים בטווח ובסינון שנבחרו
      </p>
    );
  }

  if (kind === "instructor") {
    return (
      <div className={wrapperClass}>
        <table className={`${APP_TABLE_CLASS} report-print-table min-w-[960px]`}>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className={APP_TABLE_TH_CLASS}>תאריך</th>
              <th className={APP_TABLE_TH_CLASS}>שעה</th>
              <th className={APP_TABLE_TH_CLASS}>מוסד</th>
              <th className={APP_TABLE_TH_CLASS}>קורס</th>
              <th className={APP_TABLE_TH_CLASS}>שעות מדריך</th>
              <th className={APP_TABLE_TH_CLASS}>תעריף מדריך</th>
              <th className={APP_TABLE_TH_CLASS}>סה״כ לתשלום</th>
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
                <td className={APP_TABLE_TD_CLASS}>{row.institutionName}</td>
                <td className={`${APP_TABLE_TD_CLASS} text-foreground`}>{row.courseName}</td>
                <td className={APP_TABLE_TD_CLASS}>
                  {formatSessionHoursDisplay(row.instructorHours)}
                </td>
                <td className={APP_TABLE_TD_CLASS}>{formatRate(row.instructorHourlyRate)}</td>
                <td className={APP_TABLE_TD_CLASS}>
                  {formatMoney(row.financials.instructorPayout)}
                </td>
                <td className={APP_TABLE_TD_CLASS}>{formatSessionStatusLabel(row.status)}</td>
                <td className={APP_TABLE_NOTES_CLASS}>{row.notes}</td>
              </tr>
            ))}
            <TotalsRow report={report} colSpan={9} />
          </tbody>
        </table>
      </div>
    );
  }

  if (kind === "institution") {
    return (
      <div className={wrapperClass}>
        <table className={`${APP_TABLE_CLASS} report-print-table min-w-[1400px]`}>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className={APP_TABLE_TH_CLASS}>תאריך</th>
              <th className={APP_TABLE_TH_CLASS}>שעה</th>
              <th className={APP_TABLE_TH_CLASS}>קורס</th>
              <th className={APP_TABLE_TH_CLASS}>מדריך</th>
              <th className={APP_TABLE_TH_CLASS}>שעות חברה</th>
              <th className={APP_TABLE_TH_CLASS}>תעריף חברה</th>
              <FinancialHeaders />
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
                <td className={`${APP_TABLE_TD_CLASS} text-foreground`}>{row.courseName}</td>
                <td className={APP_TABLE_TD_CLASS}>{row.instructorName}</td>
                <td className={APP_TABLE_TD_CLASS}>
                  {formatSessionHoursDisplay(row.companyHours)}
                </td>
                <td className={APP_TABLE_TD_CLASS}>{formatRate(row.institutionHourlyRate)}</td>
                <FinancialCells row={row} />
                <td className={APP_TABLE_TD_CLASS}>{formatSessionStatusLabel(row.status)}</td>
                <td className={APP_TABLE_NOTES_CLASS}>{row.notes}</td>
              </tr>
            ))}
            <TotalsRow report={report} colSpan={6} />
          </tbody>
        </table>
      </div>
    );
  }

  if (kind === "supplier") {
    return (
      <div className={wrapperClass}>
        <table className={`${APP_TABLE_CLASS} report-print-table min-w-[1400px]`}>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className={APP_TABLE_TH_CLASS}>תאריך</th>
              <th className={APP_TABLE_TH_CLASS}>שעה</th>
              <th className={APP_TABLE_TH_CLASS}>מוסד</th>
              <th className={APP_TABLE_TH_CLASS}>קורס</th>
              <th className={APP_TABLE_TH_CLASS}>מדריך</th>
              <th className={APP_TABLE_TH_CLASS}>שעות חברה</th>
              <FinancialHeaders />
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
                <td className={APP_TABLE_TD_CLASS}>{row.institutionName}</td>
                <td className={`${APP_TABLE_TD_CLASS} text-foreground`}>{row.courseName}</td>
                <td className={APP_TABLE_TD_CLASS}>{row.instructorName}</td>
                <td className={APP_TABLE_TD_CLASS}>
                  {formatSessionHoursDisplay(row.companyHours)}
                </td>
                <FinancialCells row={row} />
                <td className={APP_TABLE_TD_CLASS}>{formatSessionStatusLabel(row.status)}</td>
                <td className={APP_TABLE_NOTES_CLASS}>{row.notes}</td>
              </tr>
            ))}
            <TotalsRow report={report} colSpan={6} />
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <table className={`${APP_TABLE_CLASS} report-print-table min-w-[1600px]`}>
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
            <th className={APP_TABLE_TH_CLASS}>תעריף חברה</th>
            <th className={APP_TABLE_TH_CLASS}>תעריף מדריך</th>
            <FinancialHeaders />
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
              <FinancialCells row={row} />
              <td className={APP_TABLE_TD_CLASS}>{formatSessionStatusLabel(row.status)}</td>
              <td className={APP_TABLE_NOTES_CLASS}>{row.notes}</td>
            </tr>
          ))}
          <TotalsRow report={report} colSpan={10} />
        </tbody>
      </table>
    </div>
  );
}
