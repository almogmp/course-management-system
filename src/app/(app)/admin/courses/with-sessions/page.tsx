import { notFound } from "next/navigation";

import { CreateCourseWithSessionsForm } from "@/components/admin/create-course-with-sessions-form";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { isAdminEmail } from "@/config/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { getAuthSnapshot } from "@/lib/auth/session";
import { getCourseFormOptions } from "@/lib/courses/get-course-form-options";
import { buildSchoolYearOptions, getCurrentSchoolYearStartYear } from "@/lib/school-year";

export default async function AdminCreateCourseWithSessionsPage() {
  await requireAdmin();
  const { user, isAdmin } = await getAuthSnapshot();

  if (!isAdmin || !user?.email || !isAdminEmail(user.email)) {
    notFound();
  }

  const options = await getCourseFormOptions();
  const currentSchoolYearStart = getCurrentSchoolYearStartYear();
  const schoolYearOptions = buildSchoolYearOptions(currentSchoolYearStart, 3);

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 text-start">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">קורס + מפגשים</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            יצירת קורס חדש עם מפגשים בבת אחת — למנהל בלבד
          </p>
        </div>
        <ButtonLink href="/courses?create=1" variant="secondary" className="w-full shrink-0 sm:w-auto">
          קורס בלבד
        </ButtonLink>
      </header>

      <CreateCourseWithSessionsForm
        options={options}
        schoolYearOptions={schoolYearOptions}
        defaultSchoolYearStart={currentSchoolYearStart}
      />
    </Container>
  );
}
