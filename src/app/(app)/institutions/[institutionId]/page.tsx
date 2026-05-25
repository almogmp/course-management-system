import Link from "next/link";
import { notFound } from "next/navigation";

import { InstitutionCoordinatorsPanel } from "@/components/institutions/institution-coordinators-panel";
import { InstitutionEditForm } from "@/components/institutions/institution-edit-form";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/guards";
import { getInstitutionCoordinators } from "@/lib/institutions/get-institution-coordinators";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InstitutionDetailPageProps = {
  params: {
    institutionId: string;
  };
  searchParams?: {
    success?: string;
    error?: string;
  };
};

const successMessages: Record<string, string> = {
  institution_updated: "פרטי המוסד עודכנו.",
  coordinator_created: "הרכז נוסף בהצלחה.",
  coordinator_updated: "פרטי הרכז עודכנו.",
  coordinator_removed: "הרכז הושבת.",
};

export default async function InstitutionDetailPage({
  params,
  searchParams,
}: InstitutionDetailPageProps) {
  await requireAdmin();

  const supabase = await createServerSupabaseClient();
  const [{ data: institution, error }, { data: suppliers, error: suppliersError }] =
    await Promise.all([
      supabase
        .from("institutions")
        .select("id, name, city, phone, coordinator, primary_supplier_id, is_own_supplier")
        .eq("id", params.institutionId)
        .maybeSingle(),
      supabase.from("primary_suppliers").select("id, name").eq("is_active", true).order("name"),
    ]);

  if (suppliersError) {
    throw new Error(suppliersError.message);
  }

  if (error) {
    throw new Error(error.message);
  }

  if (!institution) {
    notFound();
  }

  const coordinators = await getInstitutionCoordinators(institution.id);
  const successKey = searchParams?.success;
  const successMessage = successKey ? successMessages[successKey] : null;
  const errorMessage =
    typeof searchParams?.error === "string"
      ? decodeURIComponent(searchParams.error)
      : null;

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-start">
        <Link
          href="/institutions"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          חזרה למוסדות
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{institution.name}</h1>
        <p className="text-sm text-muted-foreground">
          {institution.city}
          {institution.phone ? ` · ${institution.phone}` : null}
        </p>
        {institution.coordinator ? (
          <p className="text-xs text-muted-foreground">
            רכז ישן (שדה מערכת): {institution.coordinator}
          </p>
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
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <InstitutionEditForm
        institution={{
          id: institution.id,
          name: institution.name,
          city: institution.city,
          phone: institution.phone,
          primary_supplier_id: institution.primary_supplier_id,
          is_own_supplier: institution.is_own_supplier,
        }}
        suppliers={suppliers ?? []}
      />

      <InstitutionCoordinatorsPanel
        institutionId={institution.id}
        coordinators={coordinators}
      />
    </Container>
  );
}
