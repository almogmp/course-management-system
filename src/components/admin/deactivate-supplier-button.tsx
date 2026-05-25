import { deactivateSupplierAction } from "@/app/(app)/admin/entity-actions";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";

type DeactivateSupplierButtonProps = {
  supplierId: string;
  supplierName: string;
};

export function DeactivateSupplierButton({
  supplierId,
  supplierName,
}: DeactivateSupplierButtonProps) {
  const action = deactivateSupplierAction.bind(null, supplierId);

  return (
    <form action={action} className="inline">
      <ConfirmSubmitButton
        variant="danger"
        idleLabel="השבתת ספק"
        confirmMessage={`להשבית את הספק "${supplierName}"? מוסדות מקושרים לא יימחקו; הספק לא יופיע בבחירות חדשות.`}
      />
    </form>
  );
}
