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
      "תקבול ברוטו (בפועל)",
      "תקבול ברוטו (פוטנציאלי)",
      "מע״מ (בפועל)",
      "תקבול נטו לפני מדריך (בפועל)",
      "שכר מדריך (בפועל)",
      "שכר מדריך (פוטנציאלי)",
      "רווח ברוטו (בפועל)",
      "רווח נקי (בפועל)",
      "רווח נקי (פוטנציאלי)",
    ]),
  );
  const fin = report.summary.financial;
  lines.push(
    rowToCsv([
      formatCurrency(fin.actualGrossRevenue),
      formatCurrency(fin.potentialGrossRevenue),
      formatCurrency(fin.actualVatAmount),
      formatCurrency(fin.actualNetRevenueBeforeInstructor),
      formatCurrency(fin.actualInstructorPayout),
      formatCurrency(fin.potentialInstructorPayout),
      formatCurrency(fin.actualGrossProfit),
      formatCurrency(fin.actualNetProfit),
      formatCurrency(fin.potentialNetProfit),
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
      "תקבול ברוטו",
      "מע״מ",
      "תקבול נטו לפני מדריך",
      "שכר מדריך",
      "רווח ברוטו",
      "רווח נקי",
    ]),
  );

  for (const row of report.institutionRows) {
    lines.push(
      rowToCsv([
        row.institutionName,
        row.sessionCount,
        row.completedCount,
        row.cancelledCount,
        formatCurrency(row.actualGrossRevenue),
        formatCurrency(row.actualVatAmount),
        formatCurrency(row.actualNetRevenueBeforeInstructor),
        formatCurrency(row.actualInstructorPayout),
        formatCurrency(row.actualGrossProfit),
        formatCurrency(row.actualNetProfit),
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
      "תקבול ברוטו",
      "מע״מ",
      "תקבול נטו לפני מדריך",
      "שכר מדריך",
      "רווח ברוטו",
      "רווח נקי",
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
        formatCurrency(row.actualGrossRevenue),
        formatCurrency(row.actualVatAmount),
        formatCurrency(row.actualNetRevenueBeforeInstructor),
        formatCurrency(row.actualInstructorPayout),
        formatCurrency(row.actualGrossProfit),
        formatCurrency(row.actualNetProfit),
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
