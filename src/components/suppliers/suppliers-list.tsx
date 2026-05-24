import type { SupplierListItem } from "@/components/suppliers/get-suppliers";

type SuppliersListProps = {
  suppliers: SupplierListItem[];
};

export function SuppliersList({ suppliers }: SuppliersListProps) {
  return (
    <>
      <ul className="space-y-3 md:hidden">
        {suppliers.map((supplier) => (
          <li
            key={supplier.id}
            className="rounded-xl border border-border bg-surface p-4 text-start"
          >
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">{supplier.name}</h2>
              <p className="text-sm text-muted-foreground">
                איש קשר: {supplier.contact_name}
              </p>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {supplier.phone}
              </p>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {supplier.email}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="w-full min-w-[640px] text-start text-sm">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
