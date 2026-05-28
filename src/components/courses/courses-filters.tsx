"use client";

import type { CourseFormOptions } from "@/lib/courses/get-course-form-options";
import type { SchoolYear } from "@/lib/school-year";

type CoursesFiltersProps = {
  options: Pick<CourseFormOptions, "institutions" | "instructors" | "coordinators">;
  schoolYearOptions: SchoolYear[];
  filters: {
    instructor?: string;
    institution?: string;
    coordinator?: string;
    schoolYearStart: number;
  };
};

const inputClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

export function CoursesFilters({ options, schoolYearOptions, filters }: CoursesFiltersProps) {
  return (
    <form
      method="get"
      action="/courses"
      className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="space-y-2">
        <label htmlFor="courses-filter-instructor" className="block text-xs font-medium text-muted-foreground">
          מדריך
        </label>
        <select
          id="courses-filter-instructor"
          name="instructor"
          defaultValue={filters.instructor ?? ""}
          className={inputClassName}
        >
          <option value="">הכל</option>
          {options.instructors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="courses-filter-institution" className="block text-xs font-medium text-muted-foreground">
          מוסד
        </label>
        <select
          id="courses-filter-institution"
          name="institution"
          defaultValue={filters.institution ?? ""}
          className={inputClassName}
        >
          <option value="">הכל</option>
          {options.institutions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="courses-filter-coordinator" className="block text-xs font-medium text-muted-foreground">
          רכז
        </label>
        <select
          id="courses-filter-coordinator"
          name="coordinator"
          defaultValue={filters.coordinator ?? ""}
          className={inputClassName}
        >
          <option value="">הכל</option>
          {options.coordinators.map((item) => (
            <option key={item.id} value={item.id}>
              {item.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="courses-filter-school-year" className="block text-xs font-medium text-muted-foreground">
          שנת לימודים
        </label>
        <select
          id="courses-filter-school-year"
          name="schoolYear"
          defaultValue={String(filters.schoolYearStart)}
          className={inputClassName}
        >
          {schoolYearOptions.map((sy) => (
            <option key={sy.startYear} value={String(sy.startYear)}>
              {sy.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end sm:col-span-2 lg:col-span-4">
        <button
          type="submit"
          className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:w-auto"
        >
          סנן קורסים
        </button>
      </div>
    </form>
  );
}

