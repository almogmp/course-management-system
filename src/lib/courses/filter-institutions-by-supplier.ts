export type InstitutionForSupplierFilter = {
  id: string;
  name: string;
  primary_supplier_id: string | null;
  is_own_supplier: boolean;
};

export function filterInstitutionsBySupplier(
  institutions: InstitutionForSupplierFilter[],
  supplierId: string,
): InstitutionForSupplierFilter[] {
  if (!supplierId.trim()) {
    return institutions;
  }

  return institutions.filter(
    (institution) =>
      institution.primary_supplier_id === supplierId || institution.is_own_supplier,
  );
}
