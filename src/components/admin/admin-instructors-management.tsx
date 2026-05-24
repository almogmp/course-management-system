"use client";

import { useState } from "react";

import {
  createInstructorAction,
  setInstructorActiveAction,
  updateInstructorAction,
} from "@/app/(app)/admin/instructors/actions";
import { Button } from "@/components/ui/button";
import type { AdminInstructorListItem } from "@/lib/instructors/get-admin-instructors";

type AdminInstructorsManagementProps = {
  instructors: AdminInstructorListItem[];
};

const inputClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const approvalLabels: Record<AdminInstructorListItem["approval_status"], string> = {
  approved: "מאושר",
  pending: "ממתין לאישור",
  rejected: "נדחה",
  none: "ללא חשבון",
};

export function AdminInstructorsManagement({ instructors }: AdminInstructorsManagementProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">הוספת מדריך ידנית</h2>
        <form action={createInstructorAction} className="grid gap-3 sm:grid-cols-3">
          <input
            name="full_name"
            type="text"
            required
            placeholder="שם מלא"
            className={inputClassName}
          />
          <input name="phone" type="tel" required placeholder="טלפון" className={inputClassName} dir="ltr" />
          <input name="email" type="email" required placeholder="אימייל" className={inputClassName} dir="ltr" />
          <div className="sm:col-span-3">
            <Button type="submit" className="min-h-10">
              הוספת מדריך
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">רשימת מדריכים</h2>
        {instructors.length === 0 ? (
          <p className="text-sm text-muted-foreground">אין מדריכים במערכת.</p>
        ) : (
          <ul className="space-y-3">
            {instructors.map((instructor) => {
              const isEditing = editingId === instructor.id;
              const updateAction = updateInstructorAction.bind(null, instructor.id);
              const deactivateAction = setInstructorActiveAction.bind(
                null,
                instructor.id,
                instructor.user_id,
                false,
              );
              const activateAction = setInstructorActiveAction.bind(
                null,
                instructor.id,
                instructor.user_id,
                true,
              );

              return (
                <li
                  key={instructor.id}
                  className="rounded-xl border border-border bg-surface p-4 sm:p-5"
                >
                  {isEditing ? (
                    <form action={updateAction} className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input
                          name="full_name"
                          type="text"
                          required
                          defaultValue={instructor.full_name}
                          className={inputClassName}
                        />
                        <input
                          name="phone"
                          type="tel"
                          required
                          defaultValue={instructor.phone}
                          className={inputClassName}
                          dir="ltr"
                        />
                        <input
                          name="email"
                          type="email"
                          required
                          defaultValue={instructor.email}
                          className={inputClassName}
                          dir="ltr"
                        />
                      </div>
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
                        <p className="text-lg font-semibold text-foreground">{instructor.full_name}</p>
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {instructor.email}
                        </p>
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {instructor.phone}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1 text-xs">
                          <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                            {approvalLabels[instructor.approval_status]}
                          </span>
                          <span
                            className={
                              instructor.is_active
                                ? "rounded-full bg-green-100 px-2 py-1 text-green-900"
                                : "rounded-full bg-red-100 px-2 py-1 text-red-900"
                            }
                          >
                            {instructor.is_active ? "פעיל במערכת" : "מושבת"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="min-h-9"
                          onClick={() => setEditingId(instructor.id)}
                        >
                          עריכה
                        </Button>
                        {instructor.user_id ? (
                          instructor.is_active ? (
                            <form action={deactivateAction}>
                              <Button
                                type="submit"
                                variant="secondary"
                                className="min-h-9 border-red-200 text-red-900 hover:bg-red-50"
                              >
                                השבתה
                              </Button>
                            </form>
                          ) : (
                            <form action={activateAction}>
                              <Button type="submit" className="min-h-9">
                                הפעלה
                              </Button>
                            </form>
                          )
                        ) : null}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
