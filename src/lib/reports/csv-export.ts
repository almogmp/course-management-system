import { COURSE_STATUS_LABELS } from "@/components/courses/constants";
import { formatSessionHours } from "@/components/sessions/format";
import { formatCurrency } from "@/lib/financial/format-currency";
import type { MonthlyReportData } from "@/lib/reports/types";

function escapeCsvCell(value: string | number): string {
  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function rowToCsv(cells: Array<string | number>): string {
  return cells.map(escapeCsvCell).join(",");
}

export function buildMonthlyReportCsv(
  report: MonthlyReportData,
  monthLabel: string,
): string {
  const lines: string[] = [];

  lines.push(`דוח חודשי,${monthLabel}`);
  lines.push("");
  lines.push("סיכום");
  lines.push(
    rowToCsv([
      "סך מפגשים",
      "מפגשים שבוצעו",
      "מפגשים שבוטלו",
      "שעות מדריך",
      "שעות חברה",
    ]),
  );
  lines.push(
    rowToCsv([
      report.summary.totalSessions,
      report.summary.completedCount,
      report.summary.cancelledCount,
      formatSessionHours(report.summary.instructorHours),
      formatSessionHours(report.summary.companyHours),
    ]),
  );
  lines.push("");
  lines.push("סיכום פיננסי");
  lines.push(
    rowToCsv([
      "הכנסה בפועל",
      "הכנסה פוטנציאלית",
      "שכר מדריכים בפועל",
      "שכר מדריכים פוטנציאלי",
      "רווח בפועל",
      "רווח פוטנציאלי",
    ]),
  );
  lines.push(
    rowToCsv([
      formatCurrency(report.summary.financial.actualRevenue),
      formatCurrency(report.summary.financial.potentialRevenue),
      formatCurrency(report.summary.financial.actualInstructorPayout),
      formatCurrency(report.summary.financial.potentialInstructorPayout),
      formatCurrency(report.summary.financial.actualProfit),
      formatCurrency(report.summary.financial.potentialProfit),
    ]),
  );
  lines.push("");
  lines.push("מדריכים");
  lines.push(
    rowToCsv([
      "מדריך",
      "כמות מפגשים",
      "בוצעו",
      "בוטלו",
      "ממתינים לאישור",
      "שעות מדריך",
      "שכר בפועל",
      "שכר פוטנציאלי",
    ]),
  );

  for (const row of report.instructorRows) {
    lines.push(
      rowToCsv([
        row.instructorName,
        row.sessionCount,
        row.completedCount,
        row.cancelledCount,
        row.pendingApprovalCount,
        formatSessionHours(row.instructorHours),
        formatCurrency(row.actualInstructorPayout),
        formatCurrency(row.potentialInstructorPayout),
      ]),
    );
  }

  lines.push("");
  lines.push("מוסדות");
  lines.push(
    rowToCsv([
      "מוסד",
      "כמות מפגשים",
      "בוצעו",
      "בוטלו",
      "הכנסה בפועל",
      "הכנסה פוטנציאלית",
      "רווח בפועל",
      "רווח פוטנציאלי",
    ]),
  );

  for (const row of report.institutionRows) {
    lines.push(
      rowToCsv([
        row.institutionName,
        row.sessionCount,
        row.completedCount,
        row.cancelledCount,
        formatCurrency(row.actualRevenue),
        formatCurrency(row.potentialRevenue),
        formatCurrency(row.actualProfit),
        formatCurrency(row.potentialProfit),
      ]),
    );
  }

  lines.push("");
  lines.push("קורסים");
  lines.push(
    rowToCsv([
      "קורס",
      "מוסד",
      "מדריך",
      "כמות מפגשים",
      "הכנסה בפועל",
      "הכנסה פוטנציאלית",
      "שכר מדריכים בפועל",
      "רווח בפועל",
      "סטטוס עיקרי",
    ]),
  );

  for (const row of report.courseRows) {
    lines.push(
      rowToCsv([
        row.courseName,
        row.institutionName ?? "—",
        row.instructorName,
        row.sessionCount,
        formatCurrency(row.actualRevenue),
        formatCurrency(row.potentialRevenue),
        formatCurrency(row.actualInstructorPayout),
        formatCurrency(row.actualProfit),
        COURSE_STATUS_LABELS[row.courseStatus],
      ]),
    );
  }

  return `\uFEFF${lines.join("\n")}`;
}

export function downloadCsvFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
