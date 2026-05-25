"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteSessionSeriesAction,
  updateSessionSeriesDatesAction,
} from "@/app/(app)/courses/[courseId]/sessions/series-actions";
import { Button } from "@/components/ui/button";
import type { CourseSessionSeriesListItem } from "@/lib/sessions/get-course-series";

type SessionSeriesPanelProps = {
  courseId: string;
  series: CourseSessionSeriesListItem[];
};

const inputClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function SessionSeriesPanel({ series }: SessionSeriesPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (series.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">סדרות מפגשים (יצירה מרובה)</h2>

      {message ? (
        <p className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="space-y-4">
        {series.map((item) => {
          return (
            <li key={item.id} className="rounded-lg border border-border p-4 text-start">
              <div className="mb-3 space-y-1 text-sm">
                <p className="font-medium text-foreground">
                  {item.startDate} – {item.endDate} · {item.weekdaysLabel}
                </p>
                <p className="text-muted-foreground" dir="ltr">
                  {item.startTime}–{item.endTime} · {item.defaultStatusLabel} · {item.sessionCount} מפגשים
                </p>
              </div>

              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const formData = new FormData(form);
                  const newEnd = String(formData.get("end_date") ?? "");
                  const oldEnd = item.endDate;

                  if (newEnd < oldEnd) {
                    const confirmed = window.confirm(
                      "קיצור הסדרה יסיר או יבטל מפגשים אחרי תאריך הסיום החדש. להמשיך?",
                    );

                    if (!confirmed) {
                      return;
                    }
                  }

                  startTransition(async () => {
                    setError(null);
                    setMessage(null);
                    const result = await updateSessionSeriesDatesAction(item.id, formData);

                    if (!result.ok) {
                      setError(result.error ?? "עדכון הסדרה נכשל.");
                      return;
                    }

                    setMessage(result.message ?? "הסדרה עודכנה.");
                    router.refresh();
                  });
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">תאריך התחלה</label>
                    <input
                      name="start_date"
                      type="date"
                      required
                      defaultValue={item.startDate}
                      dir="ltr"
                      className={inputClassName}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">תאריך סיום</label>
                    <input
                      name="end_date"
                      type="date"
                      required
                      defaultValue={item.endDate}
                      dir="ltr"
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">בקיצור סדרה — מפגשים אחרי תאריך הסיום:</span>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="shorten_mode" value="delete" defaultChecked />
                      מחק מפגשים
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="shorten_mode" value="cancel" />
                      בטל מפגשים
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" className="min-h-9" disabled={pending}>
                    עדכן טווח סדרה
                  </Button>
                  <Button
                    type="button"
                    className="min-h-9 border-red-200 bg-red-50 text-red-900 hover:bg-red-100"
                    disabled={pending}
                    onClick={() => {
                      if (
                        !window.confirm(
                          "למחוק את כל מפגשי הסדרה? מפגש בודד ניתן למחוק בנפרד מהטבלה.",
                        )
                      ) {
                        return;
                      }

                      startTransition(async () => {
                        setError(null);
                        const result = await deleteSessionSeriesAction(item.id);

                        if (!result.ok) {
                          setError(result.error ?? "מחיקת הסדרה נכשלה.");
                          return;
                        }

                        setMessage(result.message ?? "הסדרה נמחקה.");
                        router.refresh();
                      });
                    }}
                  >
                    מחק סדרה שלמה
                  </Button>
                </div>
              </form>

              <p className="mt-2 text-xs text-muted-foreground">
                מחיקת מפגש בודד מהטבלה אינה מוחקת את הסדרה — רק את המפגש הספציפי.
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
