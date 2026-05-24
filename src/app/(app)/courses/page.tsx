import { CreateCourseForm } from "@/components/courses/create-course-form";
import { CoursesEmptyState } from "@/components/courses/courses-empty-state";
import { CoursesList } from "@/components/courses/courses-list";
import { getCourses } from "@/components/courses/get-courses";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { getCourseFormOptions } from "@/lib/courses/get-course-form-options";
import { requireAuth } from "@/lib/auth/guards";

type CoursesPageProps = {
  searchParams?: {
    create?: string;
    error?: string;
  };
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  await requireAuth();

  const showCreateForm = searchParams?.create === "1";
  const errorMessage =
    typeof searchParams?.error === "string"
      ? decodeURIComponent(searchParams.error)
      : null;
  const courses = await getCourses();
  const courseFormOptions = showCreateForm ? await getCourseFormOptions() : null;

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 text-start">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">קורסים</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {courses.length > 0
              ? `${courses.length} קורסים במערכת`
              : "רשימת הקורסים במערכת"}
          </p>
        </div>
        {!showCreateForm ? (
          <ButtonLink href="/courses?create=1" className="w-full shrink-0 sm:w-auto">
            קורס חדש
          </ButtonLink>
        ) : null}
      </header>

      {showCreateForm && courseFormOptions ? (
        <CreateCourseForm options={courseFormOptions} errorMessage={errorMessage} />
      ) : null}

      {courses.length === 0 ? (
        <CoursesEmptyState />
      ) : (
        <CoursesList courses={courses} />
      )}
    </Container>
  );
}
