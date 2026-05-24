"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { createCourseAction } from "@/app/(app)/courses/actions";
import { Button } from "@/components/ui/button";
import type { CourseFormOptions } from "@/lib/courses/get-course-form-options";

type CreateCourseFormProps = {
  options: CourseFormOptions;
  errorMessage?: string | null;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function CreateCourseForm({ options, errorMessage }: CreateCourseFormProps) {
  const [institutionId, setInstitutionId] = useState("");

  const coordinatorsForInstitution = useMemo(
    () => options.coordinators.filter((row) => row.institution_id === institutionId),
    [options.coordinators, institutionId],
  );

  return (
    <section
      aria-labelledby="create-course-heading"
      className="rounded-xl border border-border bg-surface p-4 sm:p-6"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="create-course-heading" className="text-lg font-semibold text-foreground">
          קורס חדש
        </h2>
        <Link
          href="/courses"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ביטול
        </Link>
      </div>

      {errorMessage ? (
        <p
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <form action={createCourseAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="course-name" className="block text-sm font-medium text-foreground">
            שם קורס
          </label>
          <input id="course-name" name="name" type="text" required className={inputClassName} />
        </div>

        <div className="space-y-2">
          <label htmlFor="course-institution" className="block text-sm font-medium text-foreground">
            מוסד
          </label>
          <select
            id="course-institution"
            name="institution_id"
            required
            value={institutionId}
            onChange={(event) => setInstitutionId(event.target.value)}
            className={inputClassName}
          >
            <option value="">בחרו מוסד</option>
            {options.institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="course-coordinator" className="block text-sm font-medium text-foreground">
            רכז
          </label>
          <select
            id="course-coordinator"
            name="coordinator_id"
            required
            disabled={!institutionId}
            className={inputClassName}
          >
            <option value="">
              {institutionId ? "בחרו רכז מהמוסד" : "בחרו מוסד תחילה"}
            </option>
            {coordinatorsForInstitution.map((coordinator) => (
              <option key={coordinator.id} value={coordinator.id}>
                {coordinator.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="course-supplier" className="block text-sm font-medium text-foreground">
              ספק ראשי
            </label>
            <select id="course-supplier" name="primary_supplier_id" required className={inputClassName}>
              <option value="">בחרו ספק</option>
              {options.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="course-instructor" className="block text-sm font-medium text-foreground">
              מדריך מוביל
            </label>
            <select id="course-instructor" name="lead_instructor_id" required className={inputClassName}>
              <option value="">בחרו מדריך</option>
              {options.instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="target-hours" className="block text-sm font-medium text-foreground">
            יעד שעות מדריך (אופציונלי)
          </label>
          <input
            id="target-hours"
            name="target_instructor_hours"
            type="number"
            step="0.25"
            min="0"
            placeholder="לדוגמה: 70"
            dir="ltr"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            שמירת קורס
          </Button>
          <Link
            href="/courses"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto sm:text-base"
          >
            ביטול
          </Link>
        </div>
      </form>
    </section>
  );
}
