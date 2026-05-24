import type { InstructorSelectOption } from "@/lib/instructors/get-instructors-for-select";

type InstructorSelectFieldProps = {
  instructors: InstructorSelectOption[];
  defaultValue?: string;
  id: string;
  label?: string;
};

const selectClassName =
  "min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function InstructorSelectField({
  instructors,
  defaultValue,
  id,
  label = "רכז",
}: InstructorSelectFieldProps) {
  if (instructors.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        אין מדריכים זמינים לבחירה.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={id}
        name="assigned_instructor_id"
        required
        defaultValue={defaultValue ?? ""}
        className={selectClassName}
      >
        <option value="" disabled>
          בחר רכז
        </option>
        {instructors.map((instructor) => (
          <option key={instructor.id} value={instructor.id}>
            {instructor.full_name}
          </option>
        ))}
      </select>
    </div>
  );
}
