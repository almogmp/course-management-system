import { CreateCourseForm } from "@/components/courses/create-course-form";
import { CoursesFilters } from "@/components/courses/courses-filters";
import { CoursesEmptyState } from "@/components/courses/courses-empty-state";
import { CoursesList } from "@/components/courses/courses-list";
import { getCoursesForPage } from "@/components/courses/get-courses";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { resolveAdminDeleteFlashMessage } from "@/lib/admin-delete/flash-message";
import { getCourseFormOptions } from "@/lib/courses/get-course-form-options";
import { isAdminEmail } from "@/config/admin";
import { buildSchoolYearOptions, getCurrentSchoolYearStartYear } from "@/lib/school-year";
import { requireAuth } from "@/lib/auth/guards";
import { getAuthSnapshot } from "@/lib/auth/session";

type CoursesPageProps = {
  searchParams?: {
    create?: string;
    error?: string;
    success?: string;
    message?: string;
    instructor?: string;
    institution?: string;
    coordinator?: string;
    schoolYear?: string;
  };
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  await requireAuth();
  const { user, isAdmin } = await getAuthSnapshot();
  const showAdminLinks = Boolean(isAdmin && user?.email && isAdminEmail(user.email));

  const showCreateForm = searchParams?.create === "1";
  const { successMessage: deleteSuccessMessage, errorMessage } =
    resolveAdminDeleteFlashMessage(searchParams);

  const currentSchoolYearStart = getCurrentSchoolYearStartYear();
  const selectedSchoolYearStart = Number(searchParams?.schoolYear ?? "") || currentSchoolYearStart;
  const schoolYearOptions = buildSchoolYearOptions(currentSchoolYearStart, 3);

  const courses = await getCoursesForPage(isAdmin, {
    instructorId: searchParams?.instructor?.trim() || undefined,
    institutionId: searchParams?.institution?.trim() || undefined,
    coordinatorId: searchParams?.coordinator?.trim() || undefined,
    schoolYearStart: selectedSchoolYearStart,
  });

  const courseFormOptions = showAdminLinks ? await getCourseFormOptions() : null;

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 text-start">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">קורסים</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {courses.length > 0
              ? showAdminLinks
              ? `${courses.length} קורסים במערכת`
              : `${courses.length} הקורסים שלי`
            : showAdminLinks
              ? "רשימת הקורסים במערכת"
              : "הקורסים שלי"}
          </p>
        </div>
        {showAdminLinks && !showCreateForm ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <ButtonLink href="/courses?create=1" className="w-full shrink-0 sm:w-auto">
              קורס חדש
            </ButtonLink>
            <ButtonLink
              href="/admin/courses/with-sessions"
              variant="secondary"
              className="w-full shrink-0 sm:w-auto"
            >
              קורס + מפגשים
            </ButtonLink>
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

      {errorMessage ? (
        <p
          className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      {showAdminLinks && courseFormOptions && !showCreateForm ? (
        <CoursesFilters
          options={courseFormOptions}
          schoolYearOptions={schoolYearOptions}
          filters={{
            instructor: searchParams?.instructor?.trim() || undefined,
            institution: searchParams?.institution?.trim() || undefined,
            coordinator: searchParams?.coordinator?.trim() || undefined,
            schoolYearStart: selectedSchoolYearStart,
          }}
        />
      ) : null}

      {showCreateForm && courseFormOptions ? (
        <CreateCourseForm
          options={courseFormOptions}
          schoolYearOptions={schoolYearOptions}
          defaultSchoolYearStart={currentSchoolYearStart}
          errorMessage={errorMessage}
        />
      ) : null}

      {courses.length === 0 ? (
        <CoursesEmptyState />
      ) : (
        <CoursesList courses={courses} showAdminLinks={showAdminLinks} />
      )}
    </Container>
  );
}
