"use client";

import { useState } from "react";

import {
  createInstructorAction,
  setInstructorActiveAction,
  updateInstructorAction,
} from "@/app/(app)/admin/instructors/actions";
import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
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
              const deactivateAction = setInstructorActiveAction.bind(null, instructor.id, false);
              const activateAction = setInstructorActiveAction.bind(null, instructor.id, true);
              return (
                <li
                  key={instructor.id}
                  className="rounded-xl border border-border bg-surface p-4 text-center sm:p-5 sm:text-start"
                >
                  {isEditing ? (
                    <form action={updateAction} className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                        <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                          <label
                            htmlFor={`new-password-${instructor.id}`}
                            className="block text-sm font-medium text-foreground"
                          >
                            סיסמה חדשה
                          </label>
                          <input
                            id={`new-password-${instructor.id}`}
                            name="new_password"
                            type="password"
                            autoComplete="new-password"
                            placeholder={
                              instructor.user_id
                                ? "השאר ריק כדי לא לשנות"
                                : "הזן סיסמה ליצירת חשבון התחברות"
                            }
                            className={inputClassName}
                            dir="ltr"
                          />
                          <p className="text-xs text-muted-foreground">
                            {instructor.user_id
                              ? "ריק = הסיסמה הנוכחית נשמרת. לא ניתן לצפות בסיסמה הקיימת."
                              : "מדריך ללא חשבון — הזנת סיסמה תיצור משתמש התחברות."}
                          </p>
                        </div>
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
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1 text-center sm:text-start">
                        <p className="text-lg font-semibold text-foreground">{instructor.full_name}</p>
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {instructor.email}
                        </p>
                        <p className="text-sm text-muted-foreground" dir="ltr">
                          {instructor.phone}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs sm:justify-start">
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
                      <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                        <Button
                          type="button"
                          variant="secondary"
                          className="min-h-9"
                          onClick={() => setEditingId(instructor.id)}
                        >
                          עריכה
                        </Button>
                        {instructor.is_active ? (
                          <form action={deactivateAction}>
                            <ConfirmSubmitButton
                              variant="danger"
                              idleLabel="השבת מדריך"
                              confirmMessage={`להשבית את ${instructor.full_name}? מפגשים ודוחות קיימים יישמרו; המדריך לא יופיע בבחירות חדשות.`}
                            />
                          </form>
                        ) : (
                          <form action={activateAction}>
                            <Button type="submit" className="min-h-9">
                              הפעל מדריך
                            </Button>
                          </form>
                        )}
                        <AdminDeleteDialog
                          entityType="instructor"
                          entityId={instructor.id}
                          entityLabel={instructor.full_name}
                          returnPath="/admin/instructors"
                          triggerLabel="מחק מדריך"
                        />
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
