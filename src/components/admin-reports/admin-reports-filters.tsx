import {
  ADMIN_REPORT_STATUS_OPTIONS,
  type AdminReportSearchParams,
} from "@/lib/admin-reports/filters";
import type { AdminReportFilterOptions, AdminReportFilters } from "@/lib/admin-reports/types";

type AdminReportsFiltersProps = {
  filters: AdminReportFilters;
  options: AdminReportFilterOptions;
  rowCount: number;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

const submitClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto";

const secondarySubmitClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto";

export function AdminReportsFilters({ filters, options, rowCount }: AdminReportsFiltersProps) {
  return (
    <form
      id="admin-report-filters"
      method="get"
      action="/admin/reports"
      className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    >
      <div className="space-y-2">
        <label htmlFor="from" className="block text-sm font-medium text-foreground">
          מתאריך
        </label>
        <input
          id="from"
          name="from"
          type="date"
          required
          defaultValue={filters.fromDate}
          dir="ltr"
          className={inputClassName}
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
          defaultValue={filters.toDate}
          dir="ltr"
          className={inputClassName}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="supplier" className="block text-sm font-medium text-foreground">
          ספק
        </label>
        <select
          id="supplier"
          name="supplier"
          defaultValue={filters.supplierId ?? ""}
          className={inputClassName}
        >
          <option value="">כל הספקים</option>
          {options.suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="institution" className="block text-sm font-medium text-foreground">
          מוסד
        </label>
        <select
          id="institution"
          name="institution"
          defaultValue={filters.institutionId ?? ""}
          className={inputClassName}
        >
          <option value="">כל המוסדות</option>
          {options.institutions.map((institution) => (
            <option key={institution.id} value={institution.id}>
              {institution.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="instructor" className="block text-sm font-medium text-foreground">
          מדריך
        </label>
        <select
          id="instructor"
          name="instructor"
          defaultValue={filters.instructorId ?? ""}
          className={inputClassName}
        >
          <option value="">כל המדריכים</option>
          {options.instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.full_name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="status" className="block text-sm font-medium text-foreground">
          סטטוס
        </label>
        <select
          id="status"
          name="status"
          defaultValue={filters.status}
          className={inputClassName}
        >
          {ADMIN_REPORT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-6 sm:flex-row sm:flex-wrap sm:items-end">
        <button type="submit" className={submitClassName}>
          החל סינון
        </button>
        <button type="submit" formAction="/admin/reports/preview" className={secondarySubmitClassName}>
          הצג דוח
        </button>
        <p className="w-full text-center text-xs text-muted-foreground sm:text-start">
          {rowCount} שורות בטבלה לפי הסינון הנוכחי
        </p>
      </div>
    </form>
  );
}

export type { AdminReportSearchParams };
