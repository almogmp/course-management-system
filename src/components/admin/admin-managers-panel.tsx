"use client";

import { useState } from "react";

import { resetAdminPasswordAction } from "@/app/(app)/admin/instructors/admin-password-actions";
import { SUPER_ADMIN_EMAIL } from "@/config/admin";
import { Button } from "@/components/ui/button";
import type { AdminManagerRow } from "@/lib/admin/get-admin-managers";

type AdminManagersPanelProps = {
  managers: AdminManagerRow[];
};

const inputClassName =
  "min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function AdminManagersPanel({ managers }: AdminManagersPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (managers.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <h2 className="mb-2 text-lg font-semibold text-foreground">ניהול מנהלים</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        מנהל-על ({SUPER_ADMIN_EMAIL}) יכול לקבוע סיסמה למנהלים אחרים.
      </p>
      <ul className="space-y-3">
        {managers.map((manager) => {
          const isEditing = editingId === manager.id;
          const resetAction = resetAdminPasswordAction.bind(null, manager.id);

          return (
            <li
              key={manager.id}
              className="rounded-lg border border-border bg-background p-4 text-center sm:text-start"
            >
              {isEditing ? (
                <form action={resetAction} className="space-y-3">
                  <p className="text-sm font-medium text-foreground" dir="ltr">
                    {manager.email}
                  </p>
                  <input
                    name="new_password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="סיסמה חדשה"
                    className={inputClassName}
                    dir="ltr"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" className="min-h-9">
                      שמירת סיסמה
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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground" dir="ltr">
                      {manager.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {manager.email.toLowerCase() === SUPER_ADMIN_EMAIL
                        ? "מנהל-על"
                        : "מנהל"}
                    </p>
                  </div>
                  {manager.email.toLowerCase() !== SUPER_ADMIN_EMAIL ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-9"
                      onClick={() => setEditingId(manager.id)}
                    >
                      איפוס סיסמה
                    </Button>
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
