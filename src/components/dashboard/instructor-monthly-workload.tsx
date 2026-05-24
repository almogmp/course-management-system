import { formatSessionHours } from "@/components/sessions/format";
import type { InstructorMonthlyWorkloadStats } from "@/components/dashboard/get-instructor-dashboard-data";

type InstructorMonthlyWorkloadProps = {
  workload: InstructorMonthlyWorkloadStats;
};

export function InstructorMonthlyWorkload({ workload }: InstructorMonthlyWorkloadProps) {
  const items = [
    { label: "כמות מפגשים", value: String(workload.sessionCount) },
    { label: "שעות מדריך", value: formatSessionHours(workload.instructorHours) },
    { label: "בוצעו", value: String(workload.completedCount) },
    { label: "מתוכננים", value: String(workload.plannedCount) },
    { label: "בוטלו", value: String(workload.cancelledCount) },
    { label: "ממתינים לאישור", value: String(workload.pendingApprovalCount) },
  ] as const;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">עומס עבודה שלי בחודש</h2>
      <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="text-start">
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 text-xl font-bold text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
