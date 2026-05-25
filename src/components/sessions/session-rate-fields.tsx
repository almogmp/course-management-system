type SessionRateFieldsProps = {
  courseInstitutionRate: number;
  courseInstructorRate: number;
  defaultInstitutionOverride?: number | null;
  defaultInstructorOverride?: number | null;
  idPrefix?: string;
};

const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function SessionRateFields({
  courseInstitutionRate,
  courseInstructorRate,
  defaultInstitutionOverride = null,
  defaultInstructorOverride = null,
  idPrefix = "session",
}: SessionRateFieldsProps) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-dashed border-border p-4">
      <legend className="px-1 text-sm font-medium text-foreground">תמחור מפגש (מנהל)</legend>
      <p className="text-xs text-muted-foreground">
        ברירת מחדל מהקורס: מוסד {courseInstitutionRate} ₪/שעה · מדריך {courseInstructorRate} ₪/שעה.
        אם ריק, יילקח מחיר ברירת המחדל מהקורס.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={`${idPrefix}-institution-rate`}
            className="block text-sm font-medium text-foreground"
          >
            מחיר לשעה מהמוסד (דריסה)
          </label>
          <input
            id={`${idPrefix}-institution-rate`}
            name="institution_hourly_rate"
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            placeholder={String(courseInstitutionRate)}
            defaultValue={
              defaultInstitutionOverride !== null && defaultInstitutionOverride !== undefined
                ? defaultInstitutionOverride
                : undefined
            }
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor={`${idPrefix}-instructor-rate`}
            className="block text-sm font-medium text-foreground"
          >
            שכר מדריך לשעה (דריסה)
          </label>
          <input
            id={`${idPrefix}-instructor-rate`}
            name="instructor_hourly_rate"
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            placeholder={String(courseInstructorRate)}
            defaultValue={
              defaultInstructorOverride !== null && defaultInstructorOverride !== undefined
                ? defaultInstructorOverride
                : undefined
            }
            className={inputClassName}
          />
        </div>
      </div>
    </fieldset>
  );
}
