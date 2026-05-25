import { CreateSupplierForm } from "@/components/suppliers/create-supplier-form";
import { getSuppliers } from "@/components/suppliers/get-suppliers";
import { SuppliersEmptyState } from "@/components/suppliers/suppliers-empty-state";
import { SuppliersList } from "@/components/suppliers/suppliers-list";
import { AdminListAddButton } from "@/components/admin/admin-list-add-button";
import { Container } from "@/components/ui/container";
import { resolveAdminDeleteFlashMessage } from "@/lib/admin-delete/flash-message";
import { requireAdmin } from "@/lib/auth/guards";

type SuppliersPageProps = {
  searchParams?: {
    create?: string;
    success?: string;
    error?: string;
    message?: string;
  };
};

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  await requireAdmin();
  const showCreateForm = searchParams?.create === "1";
  const showAdminActions = true;
  const { successMessage: deleteSuccessMessage, errorMessage } =
    resolveAdminDeleteFlashMessage(searchParams);
  const successMessage =
    deleteSuccessMessage ??
    (searchParams?.success === "created" ? "הספק נוסף בהצלחה." : null);

  const suppliers = await getSuppliers();

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-4 text-center md:text-start">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">ספקים</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {suppliers.length > 0
              ? `${suppliers.length} ספקים פעילים במערכת`
              : "רשימת הספקים במערכת"}
          </p>
        </div>

        {!showCreateForm ? (
          <div className="mx-auto w-full max-w-lg md:mx-0 md:max-w-none">
            <AdminListAddButton href="/suppliers?create=1" label="הוסף ספק" />
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

      {showCreateForm ? <CreateSupplierForm errorMessage={errorMessage} /> : null}

      {suppliers.length === 0 && !showCreateForm ? (
        <SuppliersEmptyState showAdminHint={showAdminActions} />
      ) : suppliers.length > 0 ? (
        <SuppliersList
          suppliers={suppliers}
          showAdminActions={showAdminActions}
          showAddButton={!showCreateForm}
          addButtonHref="/suppliers?create=1"
          addButtonLabel="הוסף ספק"
        />
      ) : null}
    </Container>
  );
}
