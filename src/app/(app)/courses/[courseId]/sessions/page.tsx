import Link from "next/link";
import { notFound } from "next/navigation";

import { isAdminEmail } from "@/config/admin";
import { CourseSessionsManagement } from "@/components/sessions/course-sessions-management";
import { CourseSessionsSummary } from "@/components/sessions/course-sessions-summary";
import { CreateSessionForm } from "@/components/sessions/create-session-form";
import { getCourseSessionsPageData } from "@/components/sessions/get-course-sessions";
import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { Container } from "@/components/ui/container";
import { requireAuth } from "@/lib/auth/guards";
import { getCurrentInstructorId } from "@/lib/auth/instructor";
import { getAuthSnapshot } from "@/lib/auth/session";
import { getInstructorsForSelect } from "@/lib/instructors/get-instructors-for-select";
import type { InstructorSelectOption } from "@/lib/instructors/get-instructors-for-select";

type CourseSessionsPageProps = {
  params: {
    courseId: string;
  };
  searchParams?: {
    success?: string;
    error?: string;
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
  }));

  let instructors: InstructorSelectOption[] = [];

  if (showAdminActions) {
    try {
      instructors = await getInstructorsForSelect();
    } catch {
      instructors = [];
    }
  }

  const showDeleteSuccess = searchParams?.success === "deleted";
  const deleteErrorMessage =
    typeof searchParams?.error === "string"
      ? decodeURIComponent(searchParams.error)
      : null;

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
          </div>
        ) : null}
      </header>

      {showDeleteSuccess ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          המפגש נמחק בהצלחה.
        </p>
      ) : null}

      {deleteErrorMessage ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
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
        <CreateSessionForm
          courseId={course.id}
          instructors={instructors}
          defaultAssignedInstructorId={course.lead_instructor_id}
        />
      ) : null}

      <CourseSessionsManagement
        courseId={course.id}
        sessions={sessions}
        instructors={instructors}
        showAdminActions={showAdminActions}
        currentInstructorId={currentInstructorId}
      />
    </Container>
  );
}
