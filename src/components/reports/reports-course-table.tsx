import { COURSE_STATUS_LABELS } from "@/components/courses/constants";
import { formatSessionHours } from "@/components/sessions/format";
import { formatCurrency } from "@/lib/financial/format-currency";
import type { CourseReportRow } from "@/lib/reports/types";

type ReportsCourseTableProps = {
  rows: CourseReportRow[];
};

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </p>
  );
}

export function ReportsCourseTable({ rows }: ReportsCourseTableProps) {
  if (rows.length === 0) {
    return <EmptyState message="אין נתוני קורסים לחודש הנבחר." />;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">דוח לפי קורס</h2>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={row.courseId}
            className="rounded-xl border border-border bg-surface p-4 text-center"
          >
            <p className="font-semibold text-foreground">{row.courseName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {row.institutionName ?? "ללא מוסד"} · {row.instructorName}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">כמות מפגשים</dt>
                <dd className="font-medium">{row.sessionCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">סטטוס עיקרי</dt>
                <dd className="font-medium">{COURSE_STATUS_LABELS[row.courseStatus]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">שעות מדריך</dt>
                <dd className="font-medium">{formatSessionHours(row.instructorHours)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">הכנסה בפועל</dt>
                <dd className="font-medium">{formatCurrency(row.actualRevenue)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">רווח בפועל</dt>
                <dd className="font-medium">{formatCurrency(row.actualProfit)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="app-table w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium text-muted-foreground">קורס</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">מוסד</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">מדריך</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">כמות מפגשים</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">הכנסה בפועל</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">הכנסה פוטנציאלית</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">שכר מדריכים בפועל</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">רווח בפועל</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">סטטוס עיקרי</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.courseId} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{row.courseName}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.institutionName ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{row.instructorName}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.sessionCount}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCurrency(row.actualRevenue)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCurrency(row.potentialRevenue)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCurrency(row.actualInstructorPayout)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCurrency(row.actualProfit)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {COURSE_STATUS_LABELS[row.courseStatus]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
