import Link from "next/link";

import { AdminInstructorsManagement } from "@/components/admin/admin-instructors-management";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/guards";
import { resolveAdminDeleteFlashMessage } from "@/lib/admin-delete/flash-message";
import { getAdminInstructors } from "@/lib/instructors/get-admin-instructors";

type AdminInstructorsPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
  };
};

const successMessages: Record<string, string> = {
  created: "המדריך נוסף בהצלחה.",
  updated: "פרטי המדריך עודכנו.",
  updated_with_password: "פרטי המדריך והסיסמה עודכנו.",
  activated: "המדריך הופעל במערכת.",
  deactivated: "המדריך הושבת במערכת.",
  deleted: "המדריך נמחק בהצלחה",
};

export default async function AdminInstructorsPage({ searchParams }: AdminInstructorsPageProps) {
  await requireAdmin();

  const instructors = await getAdminInstructors();
  const { successMessage: deleteSuccessMessage, errorMessage } =
    resolveAdminDeleteFlashMessage(searchParams);
  const successKey = searchParams?.success;
  const successMessage =
    deleteSuccessMessage ?? (successKey ? successMessages[successKey] : null);

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-start">
        <Link
          href="/dashboard"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          חזרה לדשבורד
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">ניהול מדריכים</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          הוספה, עריכה והשבתת מדריכים — אישור בקשות נשאר בנפרד.
        </p>
        <Link
          href="/admin/instructor-approvals"
          className="inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          מעבר לאישור בקשות מדריכים
        </Link>
      </header>

      {successMessage ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {successMessage}
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

      <AdminInstructorsManagement instructors={instructors} />
    </Container>
  );
}
