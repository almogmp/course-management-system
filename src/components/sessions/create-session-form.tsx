"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";

import {
  createSessionAction,
  type CreateSessionFormState,
} from "@/app/(app)/courses/[courseId]/sessions/actions";
import { SessionFormSubmitButton } from "@/components/sessions/session-form-submit-button";
import { SessionRateFields } from "@/components/sessions/session-rate-fields";
import { InstructorSelectField } from "@/components/sessions/instructor-select-field";
import { SESSION_FORM_STATUS_OPTIONS } from "@/components/sessions/constants";
import type { InstructorSelectOption } from "@/lib/instructors/get-instructors-for-select";

type CreateSessionFormProps = {
  courseId: string;
  instructors: InstructorSelectOption[];
  defaultAssignedInstructorId?: string;
  courseInstitutionRate: number;
  courseInstructorRate: number;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const initialState: CreateSessionFormState = {};

export function CreateSessionForm({
  courseId,
  instructors,
  defaultAssignedInstructorId,
  courseInstitutionRate,
  courseInstructorRate,
}: CreateSessionFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);
  const createSession = createSessionAction.bind(null, courseId);
  const [state, formAction] = useFormState(createSession, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setFormKey((key) => key + 1);
      router.refresh();
    }
  }, [state.success, router]);

  const errorMessage = state.error ?? null;

  return (
    <section
      aria-labelledby="create-session-heading"
      className="rounded-xl border border-border bg-surface p-4 sm:p-6"
    >
      <h2 id="create-session-heading" className="mb-4 text-lg font-semibold text-foreground">
        מפגש חדש
      </h2>

      {state.success ? (
        <p
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          המפגש נוצר בהצלחה.
        </p>
      ) : null}

      {errorMessage ? (
        <p
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <form key={formKey} ref={formRef} action={formAction} className="space-y-4">
        <InstructorSelectField
          key={`instructor-${formKey}`}
          id="session-assigned-instructor"
          instructors={instructors}
          defaultValue={defaultAssignedInstructorId}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="session-date" className="block text-sm font-medium text-foreground">
              תאריך מפגש
            </label>
            <input
              id="session-date"
              name="session_date"
              type="date"
              required
              dir="ltr"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="session-status" className="block text-sm font-medium text-foreground">
              סטטוס מפגש
            </label>
            <select
              id="session-status"
              name="status"
              defaultValue="scheduled"
              className={inputClassName}
            >
              {SESSION_FORM_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="start-time" className="block text-sm font-medium text-foreground">
              שעת התחלה
            </label>
            <input
              id="start-time"
              name="start_time"
              type="time"
              required
              dir="ltr"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="end-time" className="block text-sm font-medium text-foreground">
              שעת סיום
            </label>
            <input
              id="end-time"
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
            <label
              htmlFor="instructor-hours"
              className="block text-sm font-medium text-foreground"
            >
              שעות מדריך
            </label>
            <input
              id="instructor-hours"
              name="instructor_hours"
              type="number"
              step="0.25"
              min="0"
              required
              placeholder="לדוגמה: 1.5"
              dir="ltr"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company-hours" className="block text-sm font-medium text-foreground">
              שעות חברה
            </label>
            <input
              id="company-hours"
              name="company_hours"
              type="number"
              step="0.25"
              min="0"
              required
              placeholder="לדוגמה: 2"
              dir="ltr"
              className={inputClassName}
            />
          </div>
        </div>

        <SessionRateFields
          courseInstitutionRate={courseInstitutionRate}
          courseInstructorRate={courseInstructorRate}
        />

        <div className="space-y-2">
          <label htmlFor="session-notes" className="block text-sm font-medium text-foreground">
            הערות
          </label>
          <textarea
            id="session-notes"
            name="notes"
            rows={3}
            className="min-h-24 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            חובה למלא הערות בעת ביטול מפגש.
          </p>
        </div>

        {instructors.length > 0 ? <SessionFormSubmitButton /> : null}
      </form>
    </section>
  );
}
