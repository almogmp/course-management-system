import {
  formatSessionDate,
  formatSessionHours,
  formatSessionTimeRange,
} from "@/components/sessions/format";
import { formatSessionStatusLabel } from "@/lib/admin-reports/filters";
import type { AdminReportData } from "@/lib/admin-reports/types";
import { formatCurrency } from "@/lib/financial/format-currency";

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

export function buildAdminReportCsv(report: AdminReportData): string {
  const headers = [
    "תאריך",
    "שעה",
    "ספק",
    "מוסד",
    "קורס",
    "מדריך",
    "שעות מדריך",
    "שעות חברה",
    "מחיר מוסד לשעה",
    "שכר מדריך לשעה",
    "הכנסה",
    "שכר מדריך",
    "רווח",
    "סטטוס",
    "הערות",
  ];

  const lines: string[] = [
    rowToCsv(headers),
    ...report.rows.map((row) =>
      rowToCsv([
        formatSessionDate(row.sessionDate),
        formatSessionTimeRange(row.startTime, row.endTime),
        row.supplierName,
        row.institutionName,
        row.courseName,
        row.instructorName,
        formatSessionHours(row.instructorHours),
        formatSessionHours(row.companyHours),
        formatCurrency(row.institutionHourlyRate),
        formatCurrency(row.instructorHourlyRate),
        formatCurrency(row.revenue),
        formatCurrency(row.instructorPayout),
        formatCurrency(row.profit),
        formatSessionStatusLabel(row.status),
        row.notes,
      ]),
    ),
  ];

  return `\uFEFF${lines.join("\n")}`;
}

export function downloadAdminReportCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
