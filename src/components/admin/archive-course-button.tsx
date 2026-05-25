import { archiveCourseAction } from "@/app/(app)/admin/entity-actions";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";

type ArchiveCourseButtonProps = {
  courseId: string;
  courseName: string;
};

export function ArchiveCourseButton({ courseId, courseName }: ArchiveCourseButtonProps) {
  const action = archiveCourseAction.bind(null, courseId);

  return (
    <form action={action} className="inline">
      <ConfirmSubmitButton
        variant="danger"
        idleLabel="העברה לארכיון"
        confirmMessage={`להעביר את הקורס "${courseName}" לארכיון? המפגשים יישמרו לדוחות, אך הקורס לא יופיע ברשימות פעילות.`}
      />
    </form>
  );
}
