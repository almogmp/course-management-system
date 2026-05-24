import { getInstitutions } from "@/components/institutions/get-institutions";
import { InstitutionsEmptyState } from "@/components/institutions/institutions-empty-state";
import { InstitutionsList } from "@/components/institutions/institutions-list";
import { Container } from "@/components/ui/container";
import { requireAuth } from "@/lib/auth/guards";
import { getAuthSnapshot } from "@/lib/auth/session";

export default async function InstitutionsPage() {
  await requireAuth();
  const { isAdmin } = await getAuthSnapshot();

  const institutions = await getInstitutions();

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-start">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">מוסדות</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {institutions.length > 0
            ? `${institutions.length} מוסדות במערכת`
            : "רשימת המוסדות במערכת"}
        </p>
      </header>

      {institutions.length === 0 ? (
        <InstitutionsEmptyState />
      ) : (
        <InstitutionsList institutions={institutions} showManageLinks={isAdmin} />
      )}
    </Container>
  );
}
