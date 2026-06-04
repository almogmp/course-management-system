import { formatSessionHours } from "@/components/sessions/format";
import { resolveAdminReportKind } from "@/lib/admin-reports/report-type";
import type { AdminReportData } from "@/lib/admin-reports/types";
import { formatCurrency } from "@/lib/financial/format-currency";

type AdminReportsSummaryCardsProps = {
  report: AdminReportData;
  variant?: "screen" | "print";
};

function uniqueInstitutionNames(rows: AdminReportData["rows"]): string {
  const names = Array.from(
    new Set(rows.map((row) => row.institutionName).filter((name) => name !== "—")),
  );
  return names.length > 0 ? names.join("، ") : "—";
}

export function AdminReportsSummaryCards({
  report,
  variant = "screen",
}: AdminReportsSummaryCardsProps) {
  const { summary, filterLabels, filters } = report;
  const kind = resolveAdminReportKind(filters);
  const cardClass =
    variant === "print"
      ? "report-print-card"
      : "rounded-xl border border-border bg-surface p-4 text-center sm:p-5";

  if (kind === "instructor") {
    const cards = [
      { title: "שם מדריך", value: filterLabels.instructorName },
      { title: "טווח תאריכים", value: filterLabels.dateRangeLabel },
      { title: "סה״כ מפגשים", value: String(summary.totalSessions) },
      { title: "סה״כ שעות מדריך", value: formatSessionHours(summary.instructorHours) },
      { title: "סה״כ לתשלום", value: formatCurrency(summary.totalInstructorPayout) },
    ];

    return (
      <div className="report-print-summary-grid">
        {cards.map((card) => (
          <article key={card.title} className={cardClass}>
            <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
            <p className="mt-2 text-xl font-bold text-foreground sm:text-2xl">{card.value}</p>
          </article>
        ))}
      </div>
    );
  }

  const financialCards = [
    { title: "תקבול ברוטו", value: formatCurrency(summary.totalGrossRevenue) },
    { title: "מע״מ", value: formatCurrency(summary.totalVat) },
    { title: "תקבול נטו", value: formatCurrency(summary.totalNetRevenue) },
    { title: "שכר מדריכים", value: formatCurrency(summary.totalInstructorPayout) },
    { title: "רווח ברוטו", value: formatCurrency(summary.totalGrossProfit) },
    { title: "רווח נקי", value: formatCurrency(summary.totalNetProfit) },
  ];

  const baseCards =
    kind === "institution"
      ? [
          { title: "שם מוסד", value: filterLabels.institutionName },
          { title: "ספק", value: filterLabels.supplierName },
          { title: "טווח תאריכים", value: filterLabels.dateRangeLabel },
          { title: "סה״כ מפגשים", value: String(summary.totalSessions) },
          { title: "סה״כ שעות חברה", value: formatSessionHours(summary.companyHours) },
          ...financialCards,
        ]
      : kind === "supplier"
        ? [
            { title: "שם ספק", value: filterLabels.supplierName },
            { title: "טווח תאריכים", value: filterLabels.dateRangeLabel },
            { title: "מוסדות כלולים", value: uniqueInstitutionNames(report.rows) },
            { title: "סה״כ מפגשים", value: String(summary.totalSessions) },
            { title: "סה״כ שעות חברה", value: formatSessionHours(summary.companyHours) },
            ...financialCards,
          ]
        : [
            { title: "טווח תאריכים", value: filterLabels.dateRangeLabel },
            { title: "ספק", value: filterLabels.supplierName },
            { title: "מוסד", value: filterLabels.institutionName },
            { title: "מדריך", value: filterLabels.instructorName },
            { title: "סטטוס", value: filterLabels.statusLabel },
            { title: "סה״כ מפגשים", value: String(summary.totalSessions) },
            { title: "סה״כ שעות מדריך", value: formatSessionHours(summary.instructorHours) },
            { title: "סה״כ שעות חברה", value: formatSessionHours(summary.companyHours) },
            ...financialCards,
            {
              title: "מפגשים שבוטלו",
              value: String(summary.cancelledCount),
            },
            {
              title: "מפגשים שנדחו",
              value: String(summary.deferredCount),
            },
          ];

  return (
    <div className="report-print-summary-grid">
      {baseCards.map((card) => (
        <article key={card.title} className={cardClass}>
          <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
          <p className="mt-2 text-xl font-bold text-foreground sm:text-2xl">{card.value}</p>
        </article>
      ))}
    </div>
  );
}
