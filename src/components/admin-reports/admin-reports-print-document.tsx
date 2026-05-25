import { AdminReportsSummaryCards } from "@/components/admin-reports/admin-reports-summary-cards";
import { AdminReportsTable } from "@/components/admin-reports/admin-reports-table";
import type { AdminReportData } from "@/lib/admin-reports/types";

type AdminReportsPrintDocumentProps = {
  report: AdminReportData;
  generatedAt: string;
};

export function AdminReportsPrintDocument({ report, generatedAt }: AdminReportsPrintDocumentProps) {
  return (
    <article className="space-y-6 text-center" dir="rtl">
      <header className="space-y-2 border-b border-border pb-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">דוח כספי ותפעולי</h1>
        <p className="text-sm text-muted-foreground">{report.filterLabels.dateRangeLabel}</p>
        <dl className="mx-auto grid max-w-2xl gap-1 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <dt className="inline font-medium text-foreground">ספק: </dt>
            <dd className="inline">{report.filterLabels.supplierName}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">מוסד: </dt>
            <dd className="inline">{report.filterLabels.institutionName}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">מדריך: </dt>
            <dd className="inline">{report.filterLabels.instructorName}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">סטטוס: </dt>
            <dd className="inline">{report.filterLabels.statusLabel}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">נוצר בתאריך: {generatedAt}</p>
      </header>

      <AdminReportsSummaryCards summary={report.summary} />
      <AdminReportsTable rows={report.rows} />
    </article>
  );
}
