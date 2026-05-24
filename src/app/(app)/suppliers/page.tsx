import { getSuppliers } from "@/components/suppliers/get-suppliers";
import { SuppliersEmptyState } from "@/components/suppliers/suppliers-empty-state";
import { SuppliersList } from "@/components/suppliers/suppliers-list";
import { Container } from "@/components/ui/container";
import { requireAuth } from "@/lib/auth/guards";

export default async function SuppliersPage() {
  await requireAuth();

  const suppliers = await getSuppliers();

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-start">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">ספקים</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {suppliers.length > 0
            ? `${suppliers.length} ספקים במערכת`
            : "רשימת הספקים במערכת"}
        </p>
      </header>

      {suppliers.length === 0 ? (
        <SuppliersEmptyState />
      ) : (
        <SuppliersList suppliers={suppliers} />
      )}
    </Container>
  );
}
