import { CreateInstitutionForm } from "@/components/institutions/create-institution-form";
import { getInstitutions } from "@/components/institutions/get-institutions";
import { InstitutionsEmptyState } from "@/components/institutions/institutions-empty-state";
import { InstitutionsList } from "@/components/institutions/institutions-list";
import { AdminListAddButton } from "@/components/admin/admin-list-add-button";
import { Container } from "@/components/ui/container";
import { resolveAdminDeleteFlashMessage } from "@/lib/admin-delete/flash-message";
import { requireAdmin } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InstitutionsPageProps = {
  searchParams?: {
    create?: string;
    success?: string;
    error?: string;
    message?: string;
  };
};

export default async function InstitutionsPage({ searchParams }: InstitutionsPageProps) {
  await requireAdmin();
  const showCreateForm = searchParams?.create === "1";
  const showAdminActions = true;
  const { successMessage: deleteSuccessMessage, errorMessage } =
    resolveAdminDeleteFlashMessage(searchParams);
  const successMessage =
    deleteSuccessMessage ??
    (searchParams?.success === "created" ? "המוסד נוסף בהצלחה." : null);

  const institutions = await getInstitutions();
  const suppliers = showCreateForm
    ? await (async () => {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
          .from("primary_suppliers")
          .select("id, name")
          .eq("is_active", true)
          .order("name");
        if (error) {
          throw new Error(error.message);
        }
        return data ?? [];
      })()
    : [];

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-4 text-center md:text-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">מוסדות</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {institutions.length > 0
              ? `${institutions.length} מוסדות פעילים במערכת`
              : "רשימת המוסדות במערכת"}
          </p>
        </div>

        {!showCreateForm ? (
          <div className="mx-auto w-full max-w-lg md:mx-0 md:max-w-none">
            <AdminListAddButton href="/institutions?create=1" label="הוסף מוסד" />
          </div>
        ) : null}
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

      {showCreateForm ? (
        <CreateInstitutionForm suppliers={suppliers} errorMessage={errorMessage} />
      ) : null}

      {institutions.length === 0 && !showCreateForm ? (
        <InstitutionsEmptyState showAdminHint={showAdminActions} />
      ) : institutions.length > 0 ? (
        <InstitutionsList
          institutions={institutions}
          showManageLinks={showAdminActions}
          showAddButton={!showCreateForm}
          addButtonHref="/institutions?create=1"
          addButtonLabel="הוסף מוסד"
        />
      ) : null}
    </Container>
  );
}
