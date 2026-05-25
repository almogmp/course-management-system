"use client";

import Link from "next/link";

import { createSupplierAction } from "@/app/(app)/suppliers/actions";
import { Button } from "@/components/ui/button";

type CreateSupplierFormProps = {
  errorMessage?: string | null;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function CreateSupplierForm({ errorMessage }: CreateSupplierFormProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">ספק חדש</h2>
        <Link
          href="/suppliers"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ביטול
        </Link>
      </div>

      {errorMessage ? (
        <p
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <form action={createSupplierAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="supplier-name" className="block text-sm font-medium text-foreground">
            שם ספק
          </label>
          <input id="supplier-name" name="name" type="text" required className={inputClassName} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="supplier-contact" className="block text-sm font-medium text-foreground">
              איש קשר (אופציונלי)
            </label>
            <input id="supplier-contact" name="contact_name" type="text" className={inputClassName} />
          </div>
          <div className="space-y-2">
            <label htmlFor="supplier-phone" className="block text-sm font-medium text-foreground">
              טלפון (אופציונלי)
            </label>
            <input
              id="supplier-phone"
              name="phone"
              type="tel"
              dir="ltr"
              className={inputClassName}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="supplier-email" className="block text-sm font-medium text-foreground">
            דוא&quot;ל (אופציונלי)
          </label>
          <input id="supplier-email" name="email" type="email" dir="ltr" className={inputClassName} />
        </div>

        <div className="space-y-2">
          <label htmlFor="supplier-notes" className="block text-sm font-medium text-foreground">
            הערות (אופציונלי)
          </label>
          <textarea id="supplier-notes" name="notes" rows={3} className={inputClassName} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            שמירת ספק
          </Button>
          <Link
            href="/suppliers"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            ביטול
          </Link>
        </div>
      </form>
    </section>
  );
}
