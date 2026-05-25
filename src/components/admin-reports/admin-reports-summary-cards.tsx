import { formatSessionHours } from "@/components/sessions/format";
import type { AdminReportSummary } from "@/lib/admin-reports/types";
import { formatCurrency } from "@/lib/financial/format-currency";

type AdminReportsSummaryCardsProps = {
  summary: AdminReportSummary;
};

export function AdminReportsSummaryCards({ summary }: AdminReportsSummaryCardsProps) {
  const cards = [
    { title: "סה״כ מפגשים", value: String(summary.totalSessions) },
    { title: "סה״כ שעות מדריך", value: formatSessionHours(summary.instructorHours) },
    { title: "סה״כ שעות חברה", value: formatSessionHours(summary.companyHours) },
    { title: "סה״כ הכנסות", value: formatCurrency(summary.totalRevenue) },
    { title: "סה״כ שכר מדריכים", value: formatCurrency(summary.totalInstructorPayout) },
    { title: "סה״כ רווח", value: formatCurrency(summary.totalProfit) },
    { title: "סה״כ מפגשים שבוטלו", value: String(summary.cancelledCount) },
    { title: "סה״כ מפגשים שנדחו", value: String(summary.deferredCount) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-xl border border-border bg-surface p-4 text-center sm:p-5"
        >
          <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
          <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
        </article>
      ))}
    </div>
  );
}
