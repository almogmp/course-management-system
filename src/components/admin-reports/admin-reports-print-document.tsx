import { AdminReportsSummaryCards } from "@/components/admin-reports/admin-reports-summary-cards";
import { AdminReportsTable } from "@/components/admin-reports/admin-reports-table";
import {
  getAdminReportTitle,
  resolveAdminReportKind,
} from "@/lib/admin-reports/report-type";
import type { AdminReportData } from "@/lib/admin-reports/types";

type AdminReportsPrintDocumentProps = {
  report: AdminReportData;
  generatedAt: string;
};

export function AdminReportsPrintDocument({ report, generatedAt }: AdminReportsPrintDocumentProps) {
  const kind = resolveAdminReportKind(report.filters);
  const title = getAdminReportTitle(kind);

  return (
    <article className="report-print-document mx-auto max-w-[1200px] space-y-8 text-center" dir="rtl">
      <header className="report-print-header space-y-3 border-b border-border pb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {kind === "instructor" ? (
          <p className="text-base font-medium text-foreground">{report.filterLabels.instructorName}</p>
        ) : null}
        {kind === "institution" ? (
          <p className="text-base font-medium text-foreground">
            {report.filterLabels.institutionName}
          </p>
        ) : null}
        {kind === "supplier" ? (
          <p className="text-base font-medium text-foreground">{report.filterLabels.supplierName}</p>
        ) : null}
        <p className="text-sm text-muted-foreground">{report.filterLabels.dateRangeLabel}</p>
        <dl className="mx-auto grid max-w-2xl gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {kind !== "supplier" ? (
            <div>
              <dt className="inline font-medium text-foreground">ספק: </dt>
              <dd className="inline">{report.filterLabels.supplierName}</dd>
            </div>
          ) : null}
          {kind !== "institution" ? (
            <div>
              <dt className="inline font-medium text-foreground">מוסד: </dt>
              <dd className="inline">{report.filterLabels.institutionName}</dd>
            </div>
          ) : null}
          {kind !== "instructor" ? (
            <div>
              <dt className="inline font-medium text-foreground">מדריך: </dt>
              <dd className="inline">{report.filterLabels.instructorName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="inline font-medium text-foreground">סטטוס: </dt>
            <dd className="inline">{report.filterLabels.statusLabel}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">נוצר בתאריך: {generatedAt}</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">סיכום</h2>
        <AdminReportsSummaryCards report={report} variant="print" />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">פירוט מפגשים</h2>
        <AdminReportsTable report={report} variant="print" />
      </section>
    </article>
  );
}
