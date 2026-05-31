import Link from "next/link";

import { AdminManagersPanel } from "@/components/admin/admin-managers-panel";
import { AdminInstructorsManagement } from "@/components/admin/admin-instructors-management";
import { Container } from "@/components/ui/container";
import { isSuperAdminEmail } from "@/config/admin";
import { resolveAdminDeleteFlashMessage } from "@/lib/admin-delete/flash-message";
import { getAdminManagers } from "@/lib/admin/get-admin-managers";
import { requireAdmin } from "@/lib/auth/guards";
import { logServerError } from "@/lib/errors/safe-error-message";
import { getAdminInstructors } from "@/lib/instructors/get-admin-instructors";

export const dynamic = "force-dynamic";

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
  password_updated: "הסיסמה עודכנה בהצלחה",
  activated: "המדריך הופעל במערכת.",
  deactivated: "המדריך הושבת במערכת.",
  deleted: "המדריך נמחק בהצלחה",
  admin_password_updated: "סיסמת המנהל עודכנה בהצלחה.",
};

const PAGE_LOAD_ERROR =
  "לא ניתן לטעון את דף ניהול המדריכים. נסו לרענן. אם הבעיה נמשכת, בדקו את מפתח השירות ב-Vercel.";

async function AdminInstructorsPageContent({ searchParams }: AdminInstructorsPageProps) {
  const { user } = await requireAdmin();
  const showSuperAdminPanel = Boolean(user?.email && isSuperAdminEmail(user.email));

  const instructorsResult = await getAdminInstructors();
  const managersResult = showSuperAdminPanel
    ? await getAdminManagers()
    : { ok: true as const, managers: [] };

  const loadError =
    (!instructorsResult.ok && instructorsResult.error) ||
    (!managersResult.ok && managersResult.error) ||
    null;

  const instructors = instructorsResult.ok ? instructorsResult.instructors : [];
  const adminManagers = managersResult.ok ? managersResult.managers : [];

  const { successMessage: deleteSuccessMessage, errorMessage: queryErrorMessage } =
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

      {queryErrorMessage ? (
        <p
          className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {queryErrorMessage}
        </p>
      ) : null}

      {loadError ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      {!loadError && showSuperAdminPanel ? (
        <AdminManagersPanel managers={adminManagers} />
      ) : null}

      {!loadError ? <AdminInstructorsManagement instructors={instructors} /> : null}
    </Container>
  );
}

export default async function AdminInstructorsPage(props: AdminInstructorsPageProps) {
  try {
    return await AdminInstructorsPageContent(props);
  } catch (error) {
    const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

    if (digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }

    logServerError("AdminInstructorsPage", error);

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
        </header>
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {PAGE_LOAD_ERROR}
        </p>
      </Container>
    );
  }
}
