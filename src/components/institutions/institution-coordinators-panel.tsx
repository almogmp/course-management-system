"use client";

import Link from "next/link";
import { useState } from "react";

import {
  createInstitutionCoordinatorAction,
  deactivateInstitutionCoordinatorAction,
  updateInstitutionCoordinatorAction,
} from "@/app/(app)/institutions/[institutionId]/actions";
import { Button } from "@/components/ui/button";
import type { InstitutionCoordinatorRow } from "@/lib/institutions/get-institution-coordinators";

type InstitutionCoordinatorsPanelProps = {
  institutionId: string;
  coordinators: InstitutionCoordinatorRow[];
};

const inputClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function InstitutionCoordinatorsPanel({
  institutionId,
  coordinators,
}: InstitutionCoordinatorsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const createAction = createInstitutionCoordinatorAction.bind(null, institutionId);

  return (
    <section className="space-y-6 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">רכזי מוסד</h2>
        <p className="text-sm text-muted-foreground">
          רכזים לבחירה ביצירת קורסים — ניתן להוסיף, לערוך ולהשבית.
        </p>
      </div>

      <form action={createAction} className="space-y-3 rounded-lg border border-dashed border-border p-4">
        <h3 className="text-sm font-medium text-foreground">רכז חדש</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            name="full_name"
            type="text"
            required
            placeholder="שם מלא"
            className={inputClassName}
          />
          <input name="phone" type="tel" placeholder="טלפון" className={inputClassName} dir="ltr" />
          <input name="email" type="email" placeholder="אימייל" className={inputClassName} dir="ltr" />
        </div>
        <Button type="submit" className="min-h-10">
          הוספת רכז
        </Button>
      </form>

      {coordinators.length === 0 ? (
        <p className="text-sm text-muted-foreground">אין רכזים רשומים למוסד זה.</p>
      ) : (
        <ul className="space-y-3">
          {coordinators.map((coordinator) => {
            const isEditing = editingId === coordinator.id;
            const updateAction = updateInstitutionCoordinatorAction.bind(
              null,
              institutionId,
              coordinator.id,
            );
            const deactivateAction = deactivateInstitutionCoordinatorAction.bind(
              null,
              institutionId,
              coordinator.id,
            );

            return (
              <li
                key={coordinator.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                {isEditing ? (
                  <form action={updateAction} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        name="full_name"
                        type="text"
                        required
                        defaultValue={coordinator.full_name}
                        className={inputClassName}
                      />
                      <input
                        name="phone"
                        type="tel"
                        defaultValue={coordinator.phone ?? ""}
                        className={inputClassName}
                        dir="ltr"
                      />
                      <input
                        name="email"
                        type="email"
                        defaultValue={coordinator.email ?? ""}
                        className={inputClassName}
                        dir="ltr"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        name="is_active"
                        type="checkbox"
                        defaultChecked={coordinator.is_active}
                        className="size-4 rounded border-border"
                      />
                      פעיל (מופיע בבחירת קורסים)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" className="min-h-9">
                        שמירה
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-9"
                        onClick={() => setEditingId(null)}
                      >
                        ביטול
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1 text-start">
                      <p className="font-medium text-foreground">{coordinator.full_name}</p>
                      {coordinator.phone ? (
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {coordinator.phone}
                        </p>
                      ) : null}
                      {coordinator.email ? (
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {coordinator.email}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {coordinator.is_active ? "פעיל" : "מושבת"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-9"
                        onClick={() => setEditingId(coordinator.id)}
                      >
                        עריכה
                      </Button>
                      {coordinator.is_active ? (
                        <form action={deactivateAction}>
                          <Button
                            type="submit"
                            variant="secondary"
                            className="min-h-9 border-red-200 text-red-900 hover:bg-red-50"
                          >
                            השבתה
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/institutions"
        className="inline-block text-sm text-primary underline-offset-4 hover:underline"
      >
        חזרה למוסדות
      </Link>
    </section>
  );
}
