import { updateCourseRatesAction } from "@/app/(app)/courses/actions";
import { CourseRateFields } from "@/components/courses/course-rate-fields";
import { Button } from "@/components/ui/button";

type CourseRatesEditFormProps = {
  courseId: string;
  institutionHourlyRate: number;
  instructorHourlyRate: number;
};

export function CourseRatesEditForm({
  courseId,
  institutionHourlyRate,
  instructorHourlyRate,
}: CourseRatesEditFormProps) {
  const action = updateCourseRatesAction.bind(null, courseId);

  return (
    <section
      id="course-rates"
      className="scroll-mt-24 rounded-xl border border-border bg-surface p-4 sm:p-6"
    >
      <h2 className="mb-4 text-lg font-semibold text-foreground">תמחור ברירת מחדל לקורס</h2>
      <form action={action} className="space-y-4">
        <CourseRateFields
          defaultInstitutionRate={institutionHourlyRate}
          defaultInstructorRate={instructorHourlyRate}
        />
        <Button type="submit" className="min-h-10">
          שמירת תמחור קורס
        </Button>
      </form>
    </section>
  );
}
