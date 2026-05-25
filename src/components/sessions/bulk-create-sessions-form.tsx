"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createBulkSessionsAction,
  previewBulkSessionsAction,
  type BulkSessionsPreviewResult,
} from "@/app/(app)/courses/[courseId]/sessions/bulk-actions";
import { InstructorSelectField } from "@/components/sessions/instructor-select-field";
import { SessionRateFields } from "@/components/sessions/session-rate-fields";
import {
  BULK_DEFAULT_STATUS_OPTIONS,
  BULK_WEEKDAY_OPTIONS,
} from "@/components/sessions/constants";
import { Button } from "@/components/ui/button";
import type { InstructorSelectOption } from "@/lib/instructors/get-instructors-for-select";

type BulkCreateSessionsFormProps = {
  courseId: string;
  courseName: string;
  instructors: InstructorSelectOption[];
  defaultAssignedInstructorId?: string;
  courseInstitutionRate: number;
  courseInstructorRate: number;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function BulkCreateSessionsForm({
  courseId,
  courseName,
  instructors,
  defaultAssignedInstructorId,
  courseInstitutionRate,
  courseInstructorRate,
}: BulkCreateSessionsFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<BulkSessionsPreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function readFormData(form: HTMLFormElement): FormData {
    return new FormData(form);
  }

  function handlePreview(form: HTMLFormElement) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await previewBulkSessionsAction(courseId, readFormData(form));

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
      const result = await createBulkSessionsAction(courseId, readFormData(form));

      if (!result.ok) {
        setError(result.error ?? "יצירת מפגשים נכשלה.");
        return;
      }

      const created = result.createdCount ?? 0;
      const skipped = result.skippedDuplicateCount ?? 0;

      setSuccess(
        `נוצרו ${created} מפגשים.${skipped > 0 ? ` ${skipped} מפגשים דולגו כי כבר קיימים.` : ""}`,
      );
      setPreview(null);
      form.reset();
      router.refresh();
    });
  }

  if (!open) {
    return (
      <div className="flex justify-start">
        <Button type="button" className="min-h-11" onClick={() => setOpen(true)}>
          יצירת מפגשים מרובה
        </Button>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-start">
          <h2 className="text-lg font-semibold text-foreground">יצירת מפגשים מרובה</h2>
          <p className="text-sm text-muted-foreground">קורס: {courseName}</p>
        </div>
        <Button type="button" variant="secondary" className="min-h-9" onClick={() => setOpen(false)}>
          סגור
        </Button>
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
        id="bulk-sessions-form"
        className="space-y-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <input type="hidden" name="course_id" value={courseId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="bulk-start-date" className="block text-sm font-medium text-foreground">
              תאריך התחלה
            </label>
            <input
              id="bulk-start-date"
              name="start_date"
              type="date"
              required
              dir="ltr"
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="bulk-end-date" className="block text-sm font-medium text-foreground">
              תאריך סיום
            </label>
            <input
              id="bulk-end-date"
              name="end_date"
              type="date"
              required
              dir="ltr"
              className={inputClassName}
            />
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground">ימים בשבוע</legend>
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
            <label htmlFor="bulk-start-time" className="block text-sm font-medium text-foreground">
              שעת התחלה
            </label>
            <input id="bulk-start-time" name="start_time" type="time" required dir="ltr" className={inputClassName} />
          </div>
          <div className="space-y-2">
            <label htmlFor="bulk-end-time" className="block text-sm font-medium text-foreground">
              שעת סיום
            </label>
            <input id="bulk-end-time" name="end_time" type="time" required dir="ltr" className={inputClassName} />
          </div>
        </div>

        <InstructorSelectField
          id="bulk-assigned-instructor"
          instructors={instructors}
          defaultValue={defaultAssignedInstructorId}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="bulk-instructor-hours" className="block text-sm font-medium text-foreground">
              שעות מדריך
            </label>
            <input
              id="bulk-instructor-hours"
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
            <label htmlFor="bulk-company-hours" className="block text-sm font-medium text-foreground">
              שעות חברה
            </label>
            <input
              id="bulk-company-hours"
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

        <div className="space-y-2">
          <label htmlFor="bulk-default-status" className="block text-sm font-medium text-foreground">
            סטטוס ברירת מחדל
          </label>
          <select id="bulk-default-status" name="default_status" defaultValue="scheduled" className={inputClassName}>
            {BULK_DEFAULT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <SessionRateFields
          courseInstitutionRate={courseInstitutionRate}
          courseInstructorRate={courseInstructorRate}
        />

        {preview ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
            <p className="font-medium">תצוגה מקדימה</p>
            <p>יימוצרו {preview.toCreateCount} מפגשים.</p>
            {preview.skippedDuplicateCount > 0 ? (
              <p>{preview.skippedDuplicateCount} מפגשים כבר קיימים וידולגו.</p>
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
          <Button
            type="button"
            variant="secondary"
            className="min-h-10"
            disabled={pending}
            onClick={() => {
              const form = document.getElementById("bulk-sessions-form") as HTMLFormElement | null;
              if (form) {
                setPreview(null);
              }
              setOpen(false);
            }}
          >
            בטל
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-10"
            disabled={pending || instructors.length === 0}
            onClick={() => {
              const form = document.getElementById("bulk-sessions-form") as HTMLFormElement | null;
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
            disabled={pending || instructors.length === 0}
            onClick={() => {
              const form = document.getElementById("bulk-sessions-form") as HTMLFormElement | null;
              if (form) {
                handleCreate(form);
              }
            }}
          >
            צור מפגשים
          </Button>
        </div>
      </form>
    </section>
  );
}
