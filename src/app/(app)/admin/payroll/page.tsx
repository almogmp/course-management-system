import Link from "next/link";

import { parseMonthParam } from "@/components/calendar/month-calendar-utils";
import { PayrollSummaryTable } from "@/components/admin/payroll-summary-table";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/guards";
import { getMonthBounds } from "@/lib/dashboard/month-bounds";
import { getPayrollSummary } from "@/lib/financial/get-payroll-summary";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type PayrollPageProps = {
  searchParams?: {
    from?: string;
    to?: string;
    instructor?: string;
    month?: string;
  };
};

export default async function PayrollPage({ searchParams }: PayrollPageProps) {
  await requireAdmin();

  const monthView = parseMonthParam(searchParams?.month);
  const monthBounds = getMonthBounds(monthView);
  const fromDate = searchParams?.from?.trim() || monthBounds.startDate;
  const toDate = searchParams?.to?.trim() || monthBounds.endDate;
  const instructorId = searchParams?.instructor?.trim() || undefined;

  const supabase = await createServerSupabaseClient();
  const [{ data: instructors }, rows] = await Promise.all([
    supabase.from("instructors").select("id, full_name").order("full_name"),
    getPayrollSummary({ fromDate, toDate, instructorId }),
  ]);

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-start">
        <Link
          href="/dashboard"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          חזרה לדשבורד
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">שכר מדריכים</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          חישוב שכר לפי טווח תאריכים — ללא ביצוע תשלום בפועל.
        </p>
      </header>

      <form
        method="get"
        className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
      >
        <div className="space-y-2">
          <label htmlFor="month" className="block text-sm font-medium text-foreground">
            חודש (ברירת מחדל)
          </label>
          <input
            id="month"
            name="month"
            type="month"
            defaultValue={`${monthView.year}-${String(monthView.month).padStart(2, "0")}`}
            dir="ltr"
            className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="from" className="block text-sm font-medium text-foreground">
            מתאריך
          </label>
          <input
            id="from"
            name="from"
            type="date"
            required
            defaultValue={fromDate}
            dir="ltr"
            className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="to" className="block text-sm font-medium text-foreground">
            עד תאריך
          </label>
          <input
            id="to"
            name="to"
            type="date"
            required
            defaultValue={toDate}
            dir="ltr"
            className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <label htmlFor="instructor" className="block text-sm font-medium text-foreground">
            מדריך
          </label>
          <select
            id="instructor"
            name="instructor"
            defaultValue={instructorId ?? ""}
            className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="">כל המדריכים</option>
            {(instructors ?? []).map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.full_name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          הצג דוח
        </button>
      </form>

      <PayrollSummaryTable rows={rows} />
    </Container>
  );
}
