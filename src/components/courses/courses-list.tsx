import { CourseRowActions } from "@/components/courses/course-row-actions";
import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import type { CourseListItem } from "@/components/courses/get-courses";
import { MobileCard, MobileCardActions, MobileCardBody, MobileCardField } from "@/components/ui/mobile-card";
import {
  APP_TABLE_CLASS,
  APP_TABLE_TD_CLASS,
  APP_TABLE_TH_CLASS,
} from "@/components/ui/table-classes";
import { MOBILE_CARD_LIST_CLASS, MOBILE_CARD_TEXT_BLOCK_CLASS } from "@/components/ui/mobile-card-classes";

type CoursesListProps = {
  courses: CourseListItem[];
  showAdminLinks?: boolean;
};

export function CoursesList({ courses, showAdminLinks = false }: CoursesListProps) {
  return (
    <>
      <ul className={MOBILE_CARD_LIST_CLASS}>
        {courses.map((course) => (
          <MobileCard key={course.id}>
            <MobileCardBody>
              <div className={MOBILE_CARD_TEXT_BLOCK_CLASS}>
                <MobileCardField value={course.name} emphasize />
                <MobileCardField
                  label=""
                  value={course.institution_name ?? "ללא מוסד"}
                />
                <MobileCardField
                  label="מדריך: "
                  value={course.lead_instructor_name ?? "לא שובץ"}
                />
              </div>
              <MobileCardActions>
                <CourseStatusBadge status={course.status} />
                <CourseRowActions
                  courseId={course.id}
                  courseName={course.name}
                  showAdminLinks={showAdminLinks}
                  variant="card"
                />
              </MobileCardActions>
            </MobileCardBody>
          </MobileCard>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className={`${APP_TABLE_CLASS} min-w-[840px]`}>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className={APP_TABLE_TH_CLASS}>
                שם קורס
              </th>
              <th scope="col" className={APP_TABLE_TH_CLASS}>
                מוסד
              </th>
              <th scope="col" className={APP_TABLE_TH_CLASS}>
                מדריך
              </th>
              <th scope="col" className={APP_TABLE_TH_CLASS}>
                סטטוס
              </th>
              <th scope="col" className={APP_TABLE_TH_CLASS}>
                פעולות
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border last:border-b-0">
                <td className={`${APP_TABLE_TD_CLASS} font-medium text-foreground`}>
                  {course.name}
                </td>
                <td className={APP_TABLE_TD_CLASS}>{course.institution_name ?? "—"}</td>
                <td className={APP_TABLE_TD_CLASS}>
                  {course.lead_instructor_name ?? "לא שובץ"}
                </td>
                <td className={APP_TABLE_TD_CLASS}>
                  <div className="flex justify-center">
                    <CourseStatusBadge status={course.status} />
                  </div>
                </td>
                <td className={APP_TABLE_TD_CLASS}>
                  <CourseRowActions
                    courseId={course.id}
                    courseName={course.name}
                    showAdminLinks={showAdminLinks}
                    variant="table"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
