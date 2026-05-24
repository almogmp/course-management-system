import Link from "next/link";

import { createCourseAction } from "@/app/(app)/courses/actions";
import { Button } from "@/components/ui/button";

type CreateCourseFormProps = {
  errorMessage?: string | null;
};

export function CreateCourseForm({ errorMessage }: CreateCourseFormProps) {
  return (
    <section
      aria-labelledby="create-course-heading"
      className="rounded-xl border border-border bg-surface p-4 sm:p-6"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="create-course-heading" className="text-lg font-semibold text-foreground">
          קורס חדש
        </h2>
        <Link
          href="/courses"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ביטול
        </Link>
      </div>

      {errorMessage ? (
        <p
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <form action={createCourseAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="course-name" className="block text-sm font-medium text-foreground">
            שם קורס
          </label>
          <input
            id="course-name"
            name="name"
            type="text"
            required
            className="min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="course-school-year"
            className="block text-sm font-medium text-foreground"
          >
            שנת לימודים
          </label>
          <input
            id="course-school-year"
            name="school_year"
            type="text"
            required
            placeholder="2025-2026"
            dir="ltr"
            className="min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="course-coordinator"
            className="block text-sm font-medium text-foreground"
          >
            רכז
          </label>
          <input
            id="course-coordinator"
            name="coordinator"
            type="text"
            required
            className="min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="min-h-11 w-full sm:w-auto">
            שמירת קורס
          </Button>
          <Link
            href="/courses"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto sm:text-base"
          >
            ביטול
          </Link>
        </div>
      </form>
    </section>
  );
}
