import Link from "next/link";
import { notFound } from "next/navigation";

import { isAdminEmail } from "@/config/admin";
import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
import { ArchiveCourseButton } from "@/components/admin/archive-course-button";
import { CourseAdminLinks } from "@/components/courses/course-admin-links";
import { CourseRatesEditForm } from "@/components/courses/course-rates-edit-form";
import { CourseSessionsManagement } from "@/components/sessions/course-sessions-management";
import { CourseSessionsSummary } from "@/components/sessions/course-sessions-summary";
import { BulkCreateSessionsForm } from "@/components/sessions/bulk-create-sessions-form";
import { CreateSessionForm } from "@/components/sessions/create-session-form";
import { SessionSeriesPanel } from "@/components/sessions/session-series-panel";
import { getCourseSessionsPageData } from "@/components/sessions/get-course-sessions";
import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { Container } from "@/components/ui/container";
import { resolveAdminDeleteFlashMessage } from "@/lib/admin-delete/flash-message";
import { requireAuth } from "@/lib/auth/guards";
import { getCurrentInstructorId } from "@/lib/auth/instructor";
import { getAuthSnapshot } from "@/lib/auth/session";
import { getInstructorsForSelect } from "@/lib/instructors/get-instructors-for-select";
import { formatHebrewDateLabel } from "@/lib/calendar/hebrew-calendar";
import { getCourseSessionSeries } from "@/lib/sessions/get-course-series";
import type { InstructorSelectOption } from "@/lib/instructors/get-instructors-for-select";

type CourseSessionsPageProps = {
  params: {
    courseId: string;
  };
  searchParams?: {
    success?: string;
    error?: string;
    message?: string;
    created?: string;
    skipped?: string;
  };
};

export default async function CourseSessionsPage({
  params,
  searchParams,
}: CourseSessionsPageProps) {
  await requireAuth();

  const { user, isAdmin } = await getAuthSnapshot();
  const showAdminActions = Boolean(isAdmin && user?.email && isAdminEmail(user.email));
  const currentInstructorId = showAdminActions ? null : await getCurrentInstructorId();

  const pageData = await getCourseSessionsPageData(params.courseId, {
    useInstructorView: !showAdminActions,
  });

  if (!pageData) {
    notFound();
  }

  const { course, sessions: rawSessions } = pageData;
  const sessions = rawSessions.map((session) => ({
    ...session,
    assigned_instructor_id:
      session.assigned_instructor_id || currentInstructorId || session.assigned_instructor_id,
    hebrew_date_label: formatHebrewDateLabel(session.session_date),
  }));

  let instructors: InstructorSelectOption[] = [];
  let sessionSeries: Awaited<ReturnType<typeof getCourseSessionSeries>> = [];

  if (showAdminActions) {
    try {
      instructors = await getInstructorsForSelect();
    } catch {
      instructors = [];
    }

    try {
      sessionSeries = await getCourseSessionSeries(params.courseId);
    } catch {
      sessionSeries = [];
    }
  }

  const { successMessage: deleteSuccessMessage, errorMessage: deleteErrorMessage } =
    resolveAdminDeleteFlashMessage(searchParams);
  const showRatesUpdated = searchParams?.success === "rates_updated";
  const courseCreated = searchParams?.success === "course_created";
  const combinedCreated = searchParams?.success === "combined_created";
  const combinedCreatedCount = Number(searchParams?.created ?? "0");
  const combinedSkippedCount = Number(searchParams?.skipped ?? "0");

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-4 text-start">
        <Link
          href={showAdminActions ? "/courses" : "/dashboard"}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          {showAdminActions ? "חזרה לקורסים" : "חזרה לאזור אישי"}
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{course.name}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {showAdminActions ? "ניהול מפגשים" : "מפגשים שלי"}
          </p>
        </div>

        {showAdminActions ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">מוסד: </span>
              {course.institution_name ?? "—"}
            </p>
            <CourseStatusBadge status={course.status} />
            <Link
              href="/courses"
              className="text-primary underline-offset-4 hover:underline"
            >
              כל הקורסים
            </Link>
            <CourseAdminLinks courseId={course.id} compact />
            <ArchiveCourseButton courseId={course.id} courseName={course.name} />
            <AdminDeleteDialog
              entityType="course"
              entityId={course.id}
              entityLabel={course.name}
              returnPath="/courses"
              triggerLabel="מחק קורס"
              compact
            />
          </div>
        ) : null}
      </header>

      {deleteSuccessMessage ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {deleteSuccessMessage}
        </p>
      ) : null}

      {showRatesUpdated ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          תמחור הקורס עודכן בהצלחה.
        </p>
      ) : null}

      {courseCreated ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          הקורס נוצר בהצלחה. ניתן להוסיף מפגשים למטה.
        </p>
      ) : null}

      {combinedCreated ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          הקורס נוצר בהצלחה. נוצרו {combinedCreatedCount} מפגשים.
          {combinedSkippedCount > 0
            ? ` ${combinedSkippedCount} מפגשים דולגו כי כבר קיימים.`
            : ""}
        </p>
      ) : null}

      {deleteErrorMessage ? (
        <p
          className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {deleteErrorMessage}
        </p>
      ) : null}

      <CourseSessionsSummary
        sessions={sessions}
        targetInstructorHours={course.target_instructor_hours}
      />

      {showAdminActions ? (
        <>
          <CourseRatesEditForm
            courseId={course.id}
            institutionHourlyRate={course.institution_hourly_rate}
            instructorHourlyRate={course.instructor_hourly_rate}
          />
          <BulkCreateSessionsForm
            courseId={course.id}
            courseName={course.name}
            instructors={instructors}
            defaultAssignedInstructorId={course.lead_instructor_id}
            courseInstitutionRate={course.institution_hourly_rate}
            courseInstructorRate={course.instructor_hourly_rate}
          />
          <CreateSessionForm
            courseId={course.id}
            instructors={instructors}
            defaultAssignedInstructorId={course.lead_instructor_id}
            courseInstitutionRate={course.institution_hourly_rate}
            courseInstructorRate={course.instructor_hourly_rate}
          />
          <SessionSeriesPanel courseId={course.id} series={sessionSeries} />
        </>
      ) : null}

      <CourseSessionsManagement
        courseId={course.id}
        sessions={sessions}
        instructors={instructors}
        showAdminActions={showAdminActions}
        courseInstitutionRate={course.institution_hourly_rate}
        courseInstructorRate={course.instructor_hourly_rate}
      />
    </Container>
  );
}
