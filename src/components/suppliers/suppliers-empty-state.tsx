import { AdminListAddButton } from "@/components/admin/admin-list-add-button";

type SuppliersEmptyStateProps = {
  showAdminHint?: boolean;
};

export function SuppliersEmptyState({ showAdminHint = false }: SuppliersEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      <p className="text-base font-medium text-foreground">אין ספקים להצגה</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {showAdminHint
          ? "צרו ספק ראשון באמצעות הכפתור למטה."
          : "כשייווצרו ספקים במערכת, הם יופיעו כאן."}
      </p>
      {showAdminHint ? (
        <div className="mx-auto mt-6 w-full max-w-md">
          <AdminListAddButton href="/suppliers?create=1" label="הוסף ספק" />
        </div>
      ) : null}
    </div>
  );
}
