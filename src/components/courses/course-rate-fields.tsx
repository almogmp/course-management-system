type CourseRateFieldsProps = {
  defaultInstitutionRate?: number;
  defaultInstructorRate?: number;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function CourseRateFields({
  defaultInstitutionRate,
  defaultInstructorRate,
}: CourseRateFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="institution-hourly-rate" className="block text-sm font-medium text-foreground">
          מחיר לשעה מהמוסד
        </label>
        <input
          id="institution-hourly-rate"
          name="institution_hourly_rate"
          type="number"
          step="0.01"
          min="0"
          required
          dir="ltr"
          defaultValue={defaultInstitutionRate}
          placeholder="0"
          className={inputClassName}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="instructor-hourly-rate" className="block text-sm font-medium text-foreground">
          שכר מדריך לשעה
        </label>
        <input
          id="instructor-hourly-rate"
          name="instructor_hourly_rate"
          type="number"
          step="0.01"
          min="0"
          required
          dir="ltr"
          defaultValue={defaultInstructorRate}
          placeholder="0"
          className={inputClassName}
        />
      </div>
    </div>
  );
}
