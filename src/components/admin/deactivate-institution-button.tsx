import { deactivateInstitutionAction } from "@/app/(app)/admin/entity-actions";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";

type DeactivateInstitutionButtonProps = {
  institutionId: string;
  institutionName: string;
};

export function DeactivateInstitutionButton({
  institutionId,
  institutionName,
}: DeactivateInstitutionButtonProps) {
  const action = deactivateInstitutionAction.bind(null, institutionId);

  return (
    <form action={action} className="inline">
      <ConfirmSubmitButton
        variant="danger"
        idleLabel="השבתת מוסד"
        confirmMessage={`להשבית את המוסד "${institutionName}"? המוסד לא יופיע בבחירות חדשות, אך קורסים ודוחות קיימים יישמרו.`}
      />
    </form>
  );
}
