import {
  formatSessionDate,
  formatSessionHours,
  formatSessionTimeRange,
} from "@/components/sessions/format";
import { formatSessionStatusLabel } from "@/lib/admin-reports/filters";
import { resolveAdminReportKind } from "@/lib/admin-reports/report-type";
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

function financialCells(row: AdminReportData["rows"][number]): Array<string | number> {
  const { financials: f } = row;
  return [
    formatCurrency(f.grossRevenue),
    formatCurrency(f.vatAmount),
    formatCurrency(f.netRevenueBeforeInstructor),
    formatCurrency(f.instructorPayout),
    formatCurrency(f.grossProfit),
    formatCurrency(f.netProfit),
  ];
}

export function buildAdminReportCsv(report: AdminReportData): string {
  const kind = resolveAdminReportKind(report.filters);

  if (kind === "instructor") {
    const headers = [
      "תאריך",
      "שעה",
      "מוסד",
      "קורס",
      "שעות מדריך",
      "תעריף מדריך",
      "סה״כ לתשלום",
      "סטטוס",
      "הערות",
    ];

    const lines: string[] = [
      rowToCsv(headers),
      ...report.rows.map((row) =>
        rowToCsv([
          formatSessionDate(row.sessionDate),
          formatSessionTimeRange(row.startTime, row.endTime),
          row.institutionName,
          row.courseName,
          formatSessionHours(row.instructorHours),
          formatCurrency(row.instructorHourlyRate),
          formatCurrency(row.financials.instructorPayout),
          formatSessionStatusLabel(row.status),
          row.notes,
        ]),
      ),
    ];

    return `\uFEFF${lines.join("\n")}`;
  }

  const baseHeaders = [
    "תאריך",
    "שעה",
    "מוסד",
    "קורס",
    "מדריך",
    "שעות חברה",
    "תקבול ברוטו",
    "מע״מ",
    "תקבול נטו לפני מדריך",
    "שכר מדריך",
    "רווח ברוטו",
    "רווח נקי",
    "סטטוס",
    "הערות",
  ];

  const headers =
    kind === "institution"
      ? [
          "תאריך",
          "שעה",
          "קורס",
          "מדריך",
          "שעות חברה",
          "תעריף חברה",
          ...baseHeaders.slice(6),
        ]
      : kind === "supplier"
        ? baseHeaders
        : ["תאריך", "שעה", "ספק", ...baseHeaders.slice(2)];

  const lines: string[] = [
    rowToCsv(headers),
    ...report.rows.map((row) => {
      if (kind === "institution") {
        return rowToCsv([
          formatSessionDate(row.sessionDate),
          formatSessionTimeRange(row.startTime, row.endTime),
          row.courseName,
          row.instructorName,
          formatSessionHours(row.companyHours),
          formatCurrency(row.institutionHourlyRate),
          ...financialCells(row),
          formatSessionStatusLabel(row.status),
          row.notes,
        ]);
      }

      if (kind === "supplier") {
        return rowToCsv([
          formatSessionDate(row.sessionDate),
          formatSessionTimeRange(row.startTime, row.endTime),
          row.institutionName,
          row.courseName,
          row.instructorName,
          formatSessionHours(row.companyHours),
          ...financialCells(row),
          formatSessionStatusLabel(row.status),
          row.notes,
        ]);
      }

      return rowToCsv([
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
        ...financialCells(row),
        formatSessionStatusLabel(row.status),
        row.notes,
      ]);
    }),
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
