import { formatSessionHours } from "@/components/sessions/format";
import type { InstructorWorkloadRow } from "@/lib/dashboard/workload";

type AdminInstructorWorkloadTableProps = {
  rows: InstructorWorkloadRow[];
};

export function AdminInstructorWorkloadTable({ rows }: AdminInstructorWorkloadTableProps) {
  if (rows.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">עומס מדריכים לפי חודש</h2>
        <p className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center text-sm text-muted-foreground">
          אין מפגשים בחודש הנבחר.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">עומס מדריכים לפי חודש</h2>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={row.instructorId}
            className="rounded-xl border border-border bg-surface p-4 text-center"
          >
            <p className="text-base font-semibold text-foreground">{row.instructorName}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">כמות מפגשים</dt>
                <dd className="font-medium text-foreground">{row.sessionCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">שעות מדריך</dt>
                <dd className="font-medium text-foreground">
                  {formatSessionHours(row.instructorHours)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">שעות חברה</dt>
                <dd className="font-medium text-foreground">
                  {formatSessionHours(row.companyHours)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">בוצעו</dt>
                <dd className="font-medium text-foreground">{row.completedCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">מתוכננים</dt>
                <dd className="font-medium text-foreground">{row.plannedCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">בוטלו</dt>
                <dd className="font-medium text-foreground">{row.cancelledCount}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="app-table w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                מדריך
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                כמות מפגשים
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                שעות מדריך
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                שעות חברה
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                בוצעו
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                מתוכננים
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                בוטלו
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.instructorId} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{row.instructorName}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.sessionCount}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatSessionHours(row.instructorHours)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatSessionHours(row.companyHours)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{row.completedCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.plannedCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.cancelledCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
