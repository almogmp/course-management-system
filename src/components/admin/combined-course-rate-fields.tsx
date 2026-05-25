const inputClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function CombinedCourseRateFields() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="combined-institution-rate" className="block text-sm font-medium text-foreground">
          תעריף חברה
        </label>
        <input
          id="combined-institution-rate"
          name="institution_hourly_rate"
          type="number"
          step="0.01"
          min="0"
          required
          dir="ltr"
          placeholder="0"
          className={inputClassName}
        />
        <p className="text-xs text-muted-foreground">מחיר לשעה מהמוסד/חברה לקורס ולמפגשים</p>
      </div>
      <div className="space-y-2">
        <label htmlFor="combined-instructor-rate" className="block text-sm font-medium text-foreground">
          תעריף מדריך
        </label>
        <input
          id="combined-instructor-rate"
          name="instructor_hourly_rate"
          type="number"
          step="0.01"
          min="0"
          required
          dir="ltr"
          placeholder="0"
          className={inputClassName}
        />
        <p className="text-xs text-muted-foreground">שכר מדריך לשעה לקורס ולמפגשים</p>
      </div>
    </div>
  );
}
