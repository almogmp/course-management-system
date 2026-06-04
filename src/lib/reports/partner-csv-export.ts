import { formatSessionHours } from "@/components/sessions/format";
import { formatCurrency } from "@/lib/financial/format-currency";
import type { PartnerFinancialReport } from "@/lib/reports/partner-report-types";

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

const entityHeaders = [
  "שם",
  "מפגשים שבוצעו",
  "סה״כ שעות",
  "תקבול ברוטו",
  "מע״מ",
  "עלות מדריכים",
  "רווח גולמי",
];

function entityRowToCsv(
  name: string,
  row: PartnerFinancialReport["instructorRows"][number],
): string {
  return rowToCsv([
    name,
    row.completedSessionCount,
    formatSessionHours(row.totalHours),
    formatCurrency(row.grossRevenue),
    formatCurrency(row.vat),
    formatCurrency(row.instructorCost),
    formatCurrency(row.grossProfit),
  ]);
}

export function buildPartnerReportCsv(
  report: PartnerFinancialReport,
  rangeLabel: string,
): string {
  const lines: string[] = [];
  const { totals } = report;

  lines.push(`דוח כספי,${rangeLabel}`);
  lines.push("מפגשים שבוצעו בלבד");
  lines.push("");
  lines.push("סיכום כספי");
  lines.push(rowToCsv(["תקבול ברוטו", "מע״מ", "עלות מדריכים", "רווח גולמי", "מפגשים", "שעות"]));
  lines.push(
    rowToCsv([
      formatCurrency(totals.grossRevenue),
      formatCurrency(totals.vat),
      formatCurrency(totals.instructorCost),
      formatCurrency(totals.grossProfit),
      totals.completedSessionCount,
      formatSessionHours(totals.totalHours),
    ]),
  );
  lines.push("");
  lines.push("מדריכים");
  lines.push(rowToCsv(entityHeaders));
  for (const row of report.instructorRows) {
    lines.push(entityRowToCsv(row.name, row));
  }
  lines.push("");
  lines.push("מוסדות");
  lines.push(rowToCsv(entityHeaders));
  for (const row of report.institutionRows) {
    lines.push(entityRowToCsv(row.name, row));
  }

  return lines.join("\n");
}

export function downloadCsvFile(filename: string, content: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
