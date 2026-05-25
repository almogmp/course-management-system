import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
import { DeactivateSupplierButton } from "@/components/admin/deactivate-supplier-button";
import { MOBILE_CARD_ACTIONS_CLASS, TABLE_ROW_ACTIONS_CLASS } from "@/components/ui/mobile-card-classes";
import { cn } from "@/lib/utils";

type SupplierRowActionsProps = {
  supplierId: string;
  supplierName: string;
  showAdminActions: boolean;
  variant?: "card" | "table";
};

/** פעולות שורת ספק — משותף למובייל ולדסקטופ. */
export function SupplierRowActions({
  supplierId,
  supplierName,
  showAdminActions,
  variant = "table",
}: SupplierRowActionsProps) {
  if (!showAdminActions) {
    return null;
  }

  const wrapClass = variant === "card" ? MOBILE_CARD_ACTIONS_CLASS : TABLE_ROW_ACTIONS_CLASS;

  return (
    <div className={cn(wrapClass, "app-table-actions")}>
      <DeactivateSupplierButton supplierId={supplierId} supplierName={supplierName} />
      <AdminDeleteDialog
        entityType="supplier"
        entityId={supplierId}
        entityLabel={supplierName}
        returnPath="/suppliers"
        triggerLabel="מחק"
        compact
      />
    </div>
  );
}
