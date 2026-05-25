"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createCombinedCourseWithSessionsAction,
  previewCombinedCourseWithSessionsAction,
  type CombinedCourseSessionsPreview,
} from "@/app/(app)/admin/courses/with-sessions/actions";
import { CombinedCourseRateFields } from "@/components/admin/combined-course-rate-fields";
import { BULK_WEEKDAY_OPTIONS } from "@/components/sessions/constants";
import { Button } from "@/components/ui/button";
import { filterInstitutionsBySupplier } from "@/lib/courses/filter-institutions-by-supplier";
import type { CourseFormOptions } from "@/lib/courses/get-course-form-options";

type CreateCourseWithSessionsFormProps = {
  options: CourseFormOptions;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function CreateCourseWithSessionsForm({ options }: CreateCourseWithSessionsFormProps) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [preview, setPreview] = useState<CombinedCourseSessionsPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredInstitutions = useMemo(
    () => filterInstitutionsBySupplier(options.institutions, supplierId),
    [options.institutions, supplierId],
  );

  const selectedInstitution = useMemo(
    () => options.institutions.find((row) => row.id === institutionId),
    [options.institutions, institutionId],
  );

  function readFormData(form: HTMLFormElement): FormData {
    return new FormData(form);
  }

  function handleSupplierChange(nextSupplierId: string) {
    setSupplierId(nextSupplierId);
    const stillValid = filterInstitutionsBySupplier(options.institutions, nextSupplierId).some(
      (row) => row.id === institutionId,
    );

    if (!stillValid) {
      setInstitutionId("");
    }
  }

  function handleInstitutionChange(nextInstitutionId: string) {
    setInstitutionId(nextInstitutionId);
    const institution = options.institutions.find((row) => row.id === nextInstitutionId);

    if (institution?.primary_supplier_id && !institution.is_own_supplier) {
      setSupplierId(institution.primary_supplier_id);
    }
  }

  function handlePreview(form: HTMLFormElement) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await previewCombinedCourseWithSessionsAction(readFormData(form));

      if (!result.ok) {
        setPreview(null);
        setError(result.error ?? "תצוגה מקדימה נכשלה.");
        return;
      }

      setPreview(result.preview ?? null);
    });
  }

  function handleCreate(form: HTMLFormElement) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createCombinedCourseWithSessionsAction(readFormData(form));

      if (!result.ok) {
        setError(result.error ?? "יצירת קורס ומפגשים נכשלה.");
        return;
      }

      const created = result.createdCount ?? 0;
      const skipped = result.skippedDuplicateCount ?? 0;

      if (result.courseId) {
        const params = new URLSearchParams({
          success: "combined_created",
          created: String(created),
          skipped: String(skipped),
        });
        router.push(`/courses/${result.courseId}/sessions?${params.toString()}`);
        router.refresh();
        return;
      }

      setSuccess(
        `הקורס נוצר. נוצרו ${created} מפגשים.${skipped > 0 ? ` ${skipped} מפגשים דולגו.` : ""}`,
      );
      setPreview(null);
      form.reset();
      setSupplierId("");
      setInstitutionId("");
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-start">
          <h2 className="text-lg font-semibold text-foreground">קורס חדש עם מפגשים</h2>
          <p className="text-sm text-muted-foreground">
            יצירת קורס, שיוך לספק ומוסד, והקמת מפגשים בטווח תאריכים — במסך אחד
          </p>
        </div>
        <Link
          href="/courses"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          חזרה לקורסים
        </Link>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          {success}
        </p>
      ) : null}

      <form
        id="combined-course-sessions-form"
        className="space-y-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <input type="hidden" name="default_status" value="scheduled" />

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">פרטי קורס</h3>

          <div className="space-y-2">
            <label htmlFor="combined-supplier" className="block text-sm font-medium text-foreground">
              ספק
            </label>
            <select
              id="combined-supplier"
              name="primary_supplier_id"
              required
              value={supplierId}
              onChange={(event) => handleSupplierChange(event.target.value)}
              className={inputClassName}
            >
              <option value="">בחרו ספק</option>
              {options.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="combined-institution" className="block text-sm font-medium text-foreground">
              מוסד
            </label>
            <select
              id="combined-institution"
              name="institution_id"
              required
              value={institutionId}
              disabled={!supplierId}
              onChange={(event) => handleInstitutionChange(event.target.value)}
              className={inputClassName}
            >
              <option value="">
                {supplierId ? "בחרו מוסד" : "בחרו ספק תחילה"}
              </option>
              {filteredInstitutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
            {supplierId && filteredInstitutions.length === 0 ? (
              <p className="text-xs text-amber-800">אין מוסדות משויכים לספק שנבחר.</p>
            ) : null}
            {selectedInstitution?.is_own_supplier ? (
              <p className="text-xs text-muted-foreground">מוסד ספק עצמי — הספק שנבחר יישמר בקורס.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="combined-instructor" className="block text-sm font-medium text-foreground">
              מדריך
            </label>
            <select
              id="combined-instructor"
              name="lead_instructor_id"
              required
              className={inputClassName}
            >
              <option value="">בחרו מדריך</option>
              {options.instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="combined-course-name" className="block text-sm font-medium text-foreground">
              קורס
            </label>
            <input
              id="combined-course-name"
              name="name"
              type="text"
              required
              placeholder="שם הקורס"
              className={inputClassName}
            />
          </div>

          <CombinedCourseRateFields />
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <h3 className="text-base font-semibold text-foreground">מפגשים</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="combined-start-date" className="block text-sm font-medium text-foreground">
                תאריך התחלה
              </label>
              <input
                id="combined-start-date"
                name="start_date"
                type="date"
                required
                dir="ltr"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="combined-end-date" className="block text-sm font-medium text-foreground">
                תאריך סיום
              </label>
              <input
                id="combined-end-date"
                name="end_date"
                type="date"
                required
                dir="ltr"
                className={inputClassName}
              />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">יום קבוע</legend>
            <div className="flex flex-wrap gap-2">
              {BULK_WEEKDAY_OPTIONS.map((day) => (
                <label
                  key={day.value}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <input type="checkbox" name="weekdays" value={day.value} className="size-4" />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="combined-start-time" className="block text-sm font-medium text-foreground">
                שעת התחלה
              </label>
              <input
                id="combined-start-time"
                name="start_time"
                type="time"
                required
                dir="ltr"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="combined-end-time" className="block text-sm font-medium text-foreground">
                שעת סיום
              </label>
              <input
                id="combined-end-time"
                name="end_time"
                type="time"
                required
                dir="ltr"
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="combined-instructor-hours" className="block text-sm font-medium text-foreground">
                שעות מדריך
              </label>
              <input
                id="combined-instructor-hours"
                name="instructor_hours"
                type="number"
                step="0.25"
                min="0"
                required
                dir="ltr"
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="combined-company-hours" className="block text-sm font-medium text-foreground">
                שעות חברה
              </label>
              <input
                id="combined-company-hours"
                name="company_hours"
                type="number"
                step="0.25"
                min="0"
                required
                dir="ltr"
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        {preview ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
            <p className="font-medium">תצוגה מקדימה — {preview.courseName}</p>
            <p>יימוצרו {preview.toCreateCount} מפגשים.</p>
            {preview.skippedHolidayCount > 0 ? (
              <p>{preview.skippedHolidayCount} תאריכים דולגו (חגים/שבת).</p>
            ) : null}
            {preview.sampleDates.length > 0 ? (
              <p className="mt-1 text-muted-foreground">
                דוגמאות: {preview.sampleDates.join(", ")}
                {preview.toCreateCount > preview.sampleDates.length ? " …" : ""}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Link
            href="/courses"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            ביטול
          </Link>
          <Button
            type="button"
            variant="secondary"
            className="min-h-10"
            disabled={pending || options.instructors.length === 0}
            onClick={() => {
              const form = document.getElementById("combined-course-sessions-form") as HTMLFormElement | null;
              if (form) {
                handlePreview(form);
              }
            }}
          >
            הצג תצוגה מקדימה
          </Button>
          <Button
            type="button"
            className="min-h-10"
            disabled={
              pending ||
              options.instructors.length === 0 ||
              options.suppliers.length === 0
            }
            onClick={() => {
              const form = document.getElementById("combined-course-sessions-form") as HTMLFormElement | null;
              if (form) {
                handleCreate(form);
              }
            }}
          >
            צור קורס ומפגשים
          </Button>
        </div>
      </form>
    </section>
  );
}
