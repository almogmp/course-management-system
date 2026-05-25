import { AdminListAddButton } from "@/components/admin/admin-list-add-button";

type InstitutionsEmptyStateProps = {
  showAdminHint?: boolean;
};

export function InstitutionsEmptyState({ showAdminHint = false }: InstitutionsEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <p className="text-base font-medium text-foreground">אין מוסדות להצגה</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {showAdminHint
          ? "צרו מוסד ראשון באמצעות הכפתור למטה."
          : "כשייווצרו מוסדות במערכת, הם יופיעו כאן."}
      </p>
      {showAdminHint ? (
        <div className="mx-auto mt-6 w-full max-w-md">
          <AdminListAddButton href="/institutions?create=1" label="הוסף מוסד" />
        </div>
      ) : null}
    </div>
  );
}
