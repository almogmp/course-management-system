"use client";

import Link from "next/link";
import { useState } from "react";

import { createInstitutionAction } from "@/app/(app)/institutions/actions";
import { Button } from "@/components/ui/button";

type CreateInstitutionFormProps = {
  suppliers: Array<{ id: string; name: string }>;
  errorMessage?: string | null;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function CreateInstitutionForm({ suppliers, errorMessage }: CreateInstitutionFormProps) {
  const [isOwnSupplier, setIsOwnSupplier] = useState(false);
  const [supplierId, setSupplierId] = useState("");

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">מוסד חדש</h2>
        <Link
          href="/institutions"
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

      <form action={createInstitutionAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="institution-name" className="block text-sm font-medium text-foreground">
            שם מוסד
          </label>
          <input id="institution-name" name="name" type="text" required className={inputClassName} />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="is_own_supplier"
            value="1"
            checked={isOwnSupplier}
            onChange={(event) => {
              setIsOwnSupplier(event.target.checked);
              if (event.target.checked) {
                setSupplierId("");
              }
            }}
            className="size-4 rounded border-border"
          />
          המוסד הוא הספק
        </label>

        <div className="space-y-2">
          <label htmlFor="institution-supplier" className="block text-sm font-medium text-foreground">
            ספק ראשי
          </label>
          <select
            id="institution-supplier"
            name="primary_supplier_id"
            value={supplierId}
            onChange={(event) => setSupplierId(event.target.value)}
            disabled={isOwnSupplier}
            required={!isOwnSupplier}
            className={inputClassName}
          >
            <option value="">
              {isOwnSupplier ? "ייווצר ספק בשם המוסד" : "בחרו ספק"}
            </option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="institution-city" className="block text-sm font-medium text-foreground">
            עיר / מיקום (אופציונלי)
          </label>
          <input id="institution-city" name="city" type="text" className={inputClassName} />
        </div>

        <div className="space-y-2">
          <label htmlFor="institution-notes" className="block text-sm font-medium text-foreground">
            הערות (אופציונלי)
          </label>
          <textarea id="institution-notes" name="notes" rows={3} className={inputClassName} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            שמירת מוסד
          </Button>
          <Link
            href="/institutions"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            ביטול
          </Link>
        </div>
      </form>
    </section>
  );
}
