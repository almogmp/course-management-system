"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";

import {
  updateSessionAction,
  type UpdateSessionFormState,
} from "@/app/(app)/courses/[courseId]/sessions/actions";
import {
  mapDbStatusToForm,
  SESSION_FORM_STATUS_OPTIONS,
} from "@/components/sessions/constants";
import { formatTimeForInput } from "@/components/sessions/format";
import type { CourseSessionListItem } from "@/components/sessions/get-course-sessions";
import { SessionFormSubmitButton } from "@/components/sessions/session-form-submit-button";
import { SessionRateFields } from "@/components/sessions/session-rate-fields";
import { InstructorSelectField } from "@/components/sessions/instructor-select-field";
import type { InstructorSelectOption } from "@/lib/instructors/get-instructors-for-select";
import { Button } from "@/components/ui/button";

type EditSessionFormProps = {
  courseId: string;
  session: CourseSessionListItem;
  instructors: InstructorSelectOption[];
  courseInstitutionRate: number;
  courseInstructorRate: number;
  onCancel: () => void;
  onSuccess: () => void;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const initialState: UpdateSessionFormState = {};

export function EditSessionForm({
  courseId,
  session,
  instructors,
  courseInstitutionRate,
  courseInstructorRate,
  onCancel,
  onSuccess,
}: EditSessionFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const updateSession = updateSessionAction.bind(null, courseId, session.id);
  const [state, formAction] = useFormState(updateSession, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess();
      router.refresh();
    }
  }, [state.success, onSuccess, router]);

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">עריכת מפגש</h3>

      {state.error ? (
        <p
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <form ref={formRef} action={formAction} className="space-y-4">
        <InstructorSelectField
          id={`edit-assigned-instructor-${session.id}`}
          instructors={instructors}
          defaultValue={session.assigned_instructor_id}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={`edit-session-date-${session.id}`}
              className="block text-sm font-medium text-foreground"
            >
              תאריך מפגש
            </label>
            <input
              id={`edit-session-date-${session.id}`}
              name="session_date"
              type="date"
              required
              defaultValue={session.session_date}
              dir="ltr"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`edit-session-status-${session.id}`}
              className="block text-sm font-medium text-foreground"
            >
              סטטוס מפגש
            </label>
            <select
              id={`edit-session-status-${session.id}`}
              name="status"
              defaultValue={mapDbStatusToForm(session.status)}
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
            <label
              htmlFor={`edit-start-time-${session.id}`}
              className="block text-sm font-medium text-foreground"
            >
              שעת התחלה
            </label>
            <input
              id={`edit-start-time-${session.id}`}
              name="start_time"
              type="time"
              required
              defaultValue={formatTimeForInput(session.start_time)}
              dir="ltr"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`edit-end-time-${session.id}`}
              className="block text-sm font-medium text-foreground"
            >
              שעת סיום
            </label>
            <input
              id={`edit-end-time-${session.id}`}
              name="end_time"
              type="time"
              required
              defaultValue={formatTimeForInput(session.end_time)}
              dir="ltr"
              className={inputClassName}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={`edit-instructor-hours-${session.id}`}
              className="block text-sm font-medium text-foreground"
            >
              שעות מדריך
            </label>
            <input
              id={`edit-instructor-hours-${session.id}`}
              name="instructor_hours"
              type="number"
              step="0.25"
              min="0"
              required
              defaultValue={session.instructor_hours}
              placeholder="לדוגמה: 1.5"
              dir="ltr"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`edit-company-hours-${session.id}`}
              className="block text-sm font-medium text-foreground"
            >
              שעות חברה
            </label>
            <input
              id={`edit-company-hours-${session.id}`}
              name="company_hours"
              type="number"
              step="0.25"
              min="0"
              required
              defaultValue={session.company_hours}
              placeholder="לדוגמה: 2"
              dir="ltr"
              className={inputClassName}
            />
          </div>
        </div>

        <SessionRateFields
          idPrefix={`edit-${session.id}`}
          courseInstitutionRate={courseInstitutionRate}
          courseInstructorRate={courseInstructorRate}
          defaultInstitutionOverride={session.institution_hourly_rate}
          defaultInstructorOverride={session.instructor_hourly_rate}
        />

        <div className="space-y-2">
          <label
            htmlFor={`edit-session-notes-${session.id}`}
            className="block text-sm font-medium text-foreground"
          >
            הערות
          </label>
          <textarea
            id={`edit-session-notes-${session.id}`}
            name="notes"
            rows={3}
            defaultValue={session.admin_note ?? ""}
            className="min-h-24 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {instructors.length > 0 ? (
            <SessionFormSubmitButton
              idleLabel="שמירת שינויים"
              pendingLabel="שומר..."
              className="min-h-11 w-full sm:w-auto"
            />
          ) : null}
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full sm:w-auto"
            onClick={onCancel}
          >
            ביטול
          </Button>
        </div>
      </form>
    </div>
  );
}
