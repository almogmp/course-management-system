"use client";

import { useMemo, useState } from "react";

import { updateInstitutionAction } from "@/app/(app)/institutions/[institutionId]/actions";
import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
import { DeactivateInstitutionButton } from "@/components/admin/deactivate-institution-button";
import { Button } from "@/components/ui/button";

type InstitutionEditFormProps = {
  institution: {
    id: string;
    name: string;
    city: string;
    phone: string | null;
    primary_supplier_id: string | null;
    is_own_supplier: boolean;
  };
  suppliers: Array<{ id: string; name: string }>;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function InstitutionEditForm({ institution, suppliers }: InstitutionEditFormProps) {
  const [isOwnSupplier, setIsOwnSupplier] = useState(institution.is_own_supplier);
  const [supplierId, setSupplierId] = useState(institution.primary_supplier_id ?? "");

  const updateAction = updateInstitutionAction.bind(null, institution.id);

  const supplierOptions = useMemo(() => suppliers, [suppliers]);

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">פרטי מוסד</h2>
        <div className="flex flex-wrap gap-2">
          <DeactivateInstitutionButton
            institutionId={institution.id}
            institutionName={institution.name}
          />
          <AdminDeleteDialog
            entityType="institution"
            entityId={institution.id}
            entityLabel={institution.name}
            returnPath="/institutions"
            triggerLabel="מחק מוסד"
          />
        </div>
      </div>

      <form action={updateAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="institution-name" className="block text-sm font-medium text-foreground">
              שם מוסד
            </label>
            <input
              id="institution-name"
              name="name"
              type="text"
              required
              defaultValue={institution.name}
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="institution-city" className="block text-sm font-medium text-foreground">
              עיר
            </label>
            <input
              id="institution-city"
              name="city"
              type="text"
              required
              defaultValue={institution.city}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="institution-phone" className="block text-sm font-medium text-foreground">
            טלפון
          </label>
          <input
            id="institution-phone"
            name="phone"
            type="tel"
            defaultValue={institution.phone ?? ""}
            dir="ltr"
            className={inputClassName}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="is_own_supplier"
            value="1"
            checked={isOwnSupplier}
            onChange={(event) => setIsOwnSupplier(event.target.checked)}
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
            <option value="">{isOwnSupplier ? "לא נדרש — המוסד הוא הספק" : "בחרו ספק"}</option>
            {supplierOptions.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" className="min-h-11">
          שמירת שינויים
        </Button>
      </form>
    </section>
  );
}
