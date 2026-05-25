import { AdminListAddButton } from "@/components/admin/admin-list-add-button";
import { SupplierRowActions } from "@/components/suppliers/supplier-row-actions";
import type { SupplierListItem } from "@/components/suppliers/get-suppliers";
import {
  MobileCard,
  MobileCardActions,
  MobileCardBody,
  MobileCardField,
} from "@/components/ui/mobile-card";
import {
  MOBILE_CARD_INNER_LIST_CLASS,
  MOBILE_CARD_TEXT_BLOCK_CLASS,
} from "@/components/ui/mobile-card-classes";

type SuppliersListProps = {
  suppliers: SupplierListItem[];
  showAdminActions?: boolean;
  showAddButton?: boolean;
  addButtonHref?: string;
  addButtonLabel?: string;
};

export function SuppliersList({
  suppliers,
  showAdminActions = false,
  showAddButton = false,
  addButtonHref = "/suppliers?create=1",
  addButtonLabel = "הוסף ספק",
}: SuppliersListProps) {
  return (
    <>
      <div className="md:hidden">
        {showAddButton ? (
          <div className="mb-4 w-full">
            <AdminListAddButton href={addButtonHref} label={addButtonLabel} />
          </div>
        ) : null}
        <ul className={MOBILE_CARD_INNER_LIST_CLASS}>
          {suppliers.map((supplier) => (
            <MobileCard key={supplier.id}>
              <MobileCardBody>
                <div className={MOBILE_CARD_TEXT_BLOCK_CLASS}>
                  <MobileCardField value={supplier.name} emphasize />
                  <MobileCardField label="איש קשר: " value={supplier.contact_name} />
                  <MobileCardField value={supplier.phone} dir="ltr" />
                  <MobileCardField value={supplier.email} dir="ltr" />
                </div>
                <MobileCardActions>
                  <SupplierRowActions
                    supplierId={supplier.id}
                    supplierName={supplier.name}
                    showAdminActions={showAdminActions}
                    variant="card"
                  />
                </MobileCardActions>
              </MobileCardBody>
            </MobileCard>
          ))}
        </ul>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="app-table w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                שם ספק
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                איש קשר
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                טלפון
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                דוא&quot;ל
              </th>
              {showAdminActions ? (
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                  פעולות
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{supplier.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{supplier.contact_name}</td>
                <td className="px-4 py-3 text-muted-foreground" dir="ltr">
                  {supplier.phone}
                </td>
                <td className="px-4 py-3 text-muted-foreground" dir="ltr">
                  {supplier.email}
                </td>
                {showAdminActions ? (
                  <td className="px-4 py-3">
                    <SupplierRowActions
                      supplierId={supplier.id}
                      supplierName={supplier.name}
                      showAdminActions={showAdminActions}
                      variant="table"
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
