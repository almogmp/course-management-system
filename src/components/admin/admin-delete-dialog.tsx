"use client";

import { useCallback, useState, useTransition } from "react";

import {
  adminDeleteEntityAction,
  getAdminDeletePreviewAction,
} from "@/app/(app)/admin/delete-actions";
import { Button } from "@/components/ui/button";
import type { AdminDeleteEntityType, AdminDeletePreview } from "@/lib/admin-delete/types";
import { FORCE_DELETE_WARNING } from "@/lib/admin-delete/types";

type AdminDeleteDialogProps = {
  entityType: AdminDeleteEntityType;
  entityId: string;
  entityLabel: string;
  returnPath: string;
  courseId?: string;
  triggerLabel?: string;
  compact?: boolean;
};

const entityTypeLabels: Record<AdminDeleteEntityType, string> = {
  instructor: "מדריך",
  course: "קורס",
  institution: "מוסד",
  supplier: "ספק",
  session: "מפגש",
};

export function AdminDeleteDialog({
  entityType,
  entityId,
  entityLabel,
  returnPath,
  courseId,
  triggerLabel = "מחק",
  compact = false,
}: AdminDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<AdminDeletePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadPreview = useCallback(() => {
    setLoadError(null);
    setPreview(null);

    startTransition(async () => {
      const result = await getAdminDeletePreviewAction(entityType, entityId);

      if (result.ok) {
        setPreview(result.preview);
        return;
      }

      setLoadError(result.error);
    });
  }, [entityId, entityType]);

  function handleOpen() {
    setOpen(true);
    loadPreview();
  }

  function handleClose() {
    if (pending) {
      return;
    }

    setOpen(false);
    setPreview(null);
    setLoadError(null);
  }

  const typeLabel = entityTypeLabels[entityType];
  const hasDependencies = (preview?.items.length ?? 0) > 0;
  const showBlockedMessage = Boolean(preview && !preview.canNormalDelete);
  const showNormalAllowedWithDeps = Boolean(preview && preview.canNormalDelete && hasDependencies);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={
          compact
            ? "inline-flex min-h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-900 transition-colors hover:bg-red-100"
            : "inline-flex min-h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-900 transition-colors hover:bg-red-100"
        }
      >
        {triggerLabel}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-delete-dialog-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-5 text-start shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="admin-delete-dialog-title" className="text-lg font-semibold text-foreground">
              מחיקת {typeLabel}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{entityLabel}</p>

            <div className="mt-4 space-y-3 text-sm text-foreground">
              {pending && !preview && !loadError ? (
                <p className="text-muted-foreground">בודק נתונים קשורים...</p>
              ) : null}

              {loadError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800" role="alert">
                  {loadError}
                </p>
              ) : null}

              {preview ? (
                <>
                  {showBlockedMessage ? (
                    <>
                      <p className="font-medium">
                        לא ניתן למחוק {typeLabel} זה באופן רגיל.
                      </p>
                      <p className="font-medium">נמצאו:</p>
                      <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                        {preview.items.map((item) => (
                          <li key={item.label}>
                            {item.count} {item.label}
                          </li>
                        ))}
                      </ul>
                      <p className="text-muted-foreground">
                        כמנהל, תמיד ניתן להשלים מחיקה באמצעות &quot;מחיקה כפויה&quot;.
                      </p>
                    </>
                  ) : null}

                  {showNormalAllowedWithDeps ? (
                    <>
                      <p className="font-medium">נמצאו:</p>
                      <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                        {preview.items.map((item) => (
                          <li key={item.label}>
                            {item.count} {item.label}
                          </li>
                        ))}
                      </ul>
                      <p className="text-muted-foreground">ניתן למחוק באופן רגיל.</p>
                    </>
                  ) : null}

                  {!showBlockedMessage && !showNormalAllowedWithDeps ? (
                    <p>לא נמצאו נתונים קשורים. ניתן למחיקה רגילה.</p>
                  ) : null}

                  {(showBlockedMessage || showNormalAllowedWithDeps || hasDependencies) && preview ? (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
                      {FORCE_DELETE_WARNING}
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="secondary"
                className="min-h-10 w-full sm:w-auto"
                disabled={pending}
                onClick={handleClose}
              >
                ביטול
              </Button>

              <form action={adminDeleteEntityAction} className="w-full sm:w-auto">
                <input type="hidden" name="entity_type" value={entityType} />
                <input type="hidden" name="entity_id" value={entityId} />
                <input type="hidden" name="return_path" value={returnPath} />
                <input type="hidden" name="mode" value="normal" />
                {courseId ? <input type="hidden" name="course_id" value={courseId} /> : null}
                <Button
                  type="submit"
                  variant="secondary"
                  className="min-h-10 w-full"
                  disabled={pending || !preview?.canNormalDelete}
                >
                  מחיקה רגילה
                </Button>
              </form>

              <form action={adminDeleteEntityAction} className="w-full sm:w-auto">
                <input type="hidden" name="entity_type" value={entityType} />
                <input type="hidden" name="entity_id" value={entityId} />
                <input type="hidden" name="return_path" value={returnPath} />
                <input type="hidden" name="mode" value="force" />
                {courseId ? <input type="hidden" name="course_id" value={courseId} /> : null}
                <Button
                  type="submit"
                  className="min-h-10 w-full border-red-600 bg-red-600 hover:bg-red-700"
                  disabled={pending || !preview}
                >
                  מחיקה כפויה
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
