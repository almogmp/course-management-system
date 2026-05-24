"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { isAdminSeedEnabled } from "@/lib/env/app-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type InstitutionInsert = Database["public"]["Tables"]["institutions"]["Insert"];
type SupplierInsert = Database["public"]["Tables"]["primary_suppliers"]["Insert"];
type InstructorInsert = Database["public"]["Tables"]["instructors"]["Insert"];

const DEMO_INSTITUTION: InstitutionInsert = {
  name: "מוסד לדוגמה",
  city: "תל אביב",
  address: "רחוב דמו 1",
  phone: "03-0000000",
  coordinator: "רכז דמו",
};

const DEMO_SUPPLIER: SupplierInsert = {
  name: "ספק ראשי לדוגמה",
  contact_name: "איש קשר",
  phone: "03-0000000",
  email: "demo-supplier@example.com",
};

export async function seedDemoDataAction(): Promise<void> {
  if (!isAdminSeedEnabled()) {
    redirect("/dashboard");
  }

  const { user } = await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data: existingInstitution, error: institutionCheckError } = await supabase
    .from("institutions")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (institutionCheckError) {
    redirect(
      `/admin/seed?error=${encodeURIComponent(institutionCheckError.message)}`,
    );
  }

  if (!existingInstitution) {
    const { error } = await supabase.from("institutions").insert(DEMO_INSTITUTION);

    if (error) {
      redirect(`/admin/seed?error=${encodeURIComponent(error.message)}`);
    }
  }

  const { data: existingSupplier, error: supplierCheckError } = await supabase
    .from("primary_suppliers")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (supplierCheckError) {
    redirect(`/admin/seed?error=${encodeURIComponent(supplierCheckError.message)}`);
  }

  if (!existingSupplier) {
    const { error } = await supabase.from("primary_suppliers").insert(DEMO_SUPPLIER);

    if (error) {
      redirect(`/admin/seed?error=${encodeURIComponent(error.message)}`);
    }
  }

  const { data: existingInstructor, error: instructorCheckError } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (instructorCheckError) {
    redirect(`/admin/seed?error=${encodeURIComponent(instructorCheckError.message)}`);
  }

  if (!existingInstructor) {
    const email = (user.email ?? "demo@example.com").toLowerCase();

    const instructorPayload: InstructorInsert = {
      user_id: user.id,
      full_name: "מדריך דמו",
      phone: "050-0000000",
      email,
      color: "#2563EB",
    };

    const { error } = await supabase.from("instructors").insert(instructorPayload);

    if (error) {
      redirect(`/admin/seed?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/admin/seed");
  redirect("/admin/seed?success=1");
}
