import Link from "next/link";

import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import type { CourseListItem } from "@/components/courses/get-courses";

type CoursesListProps = {
  courses: CourseListItem[];
};

export function CoursesList({ courses }: CoursesListProps) {
  return (
    <>
      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {courses.map((course) => (
          <li
            key={course.id}
            className="rounded-xl border border-border bg-surface p-4 text-start"
          >
            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">{course.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {course.institution_name ?? "ללא מוסד"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <CourseStatusBadge status={course.status} />
                <span className="text-sm text-muted-foreground">{course.school_year}</span>
              </div>
              <Link
                href={`/courses/${course.id}/sessions`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto sm:text-base"
              >
                ניהול מפגשים
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="w-full min-w-[640px] text-start text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                שם קורס
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                מוסד
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                סטטוס
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                שנת לימודים
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{course.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {course.institution_name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <CourseStatusBadge status={course.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{course.school_year}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/courses/${course.id}/sessions`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    ניהול מפגשים
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
