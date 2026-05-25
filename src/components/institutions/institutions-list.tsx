import { AdminListAddButton } from "@/components/admin/admin-list-add-button";
import { InstitutionRowActions } from "@/components/institutions/institution-row-actions";
import type { InstitutionListItem } from "@/components/institutions/get-institutions";
import { MobileCard, MobileCardActions, MobileCardBody, MobileCardField } from "@/components/ui/mobile-card";
import {
  MOBILE_CARD_INNER_LIST_CLASS,
  MOBILE_CARD_TEXT_BLOCK_CLASS,
} from "@/components/ui/mobile-card-classes";

type InstitutionsListProps = {
  institutions: InstitutionListItem[];
  showManageLinks?: boolean;
  showAddButton?: boolean;
  addButtonHref?: string;
  addButtonLabel?: string;
};

export function InstitutionsList({
  institutions,
  showManageLinks = false,
  showAddButton = false,
  addButtonHref = "/institutions?create=1",
  addButtonLabel = "הוסף מוסד",
}: InstitutionsListProps) {
  return (
    <>
      <div className="md:hidden">
        {showAddButton ? (
          <div className="mb-4 w-full">
            <AdminListAddButton href={addButtonHref} label={addButtonLabel} />
          </div>
        ) : null}
        <ul className={MOBILE_CARD_INNER_LIST_CLASS}>
          {institutions.map((institution) => (
            <MobileCard key={institution.id}>
              <MobileCardBody>
                <div className={MOBILE_CARD_TEXT_BLOCK_CLASS}>
                  <MobileCardField value={institution.name} emphasize />
                  <MobileCardField value={institution.city} />
                  <MobileCardField label="רכז: " value={institution.coordinator} />
                  <MobileCardField value={institution.phone} dir="ltr" />
                  {institution.supplier_name ? (
                    <MobileCardField label="ספק: " value={institution.supplier_name} />
                  ) : null}
                </div>
                <MobileCardActions>
                  <InstitutionRowActions
                    institutionId={institution.id}
                    institutionName={institution.name}
                    showManageLinks={showManageLinks}
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
                שם מוסד
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                עיר
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                רכז
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                טלפון
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                ספק
              </th>
              {showManageLinks ? (
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                  פעולות
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {institutions.map((institution) => (
              <tr key={institution.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">{institution.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{institution.city}</td>
                <td className="px-4 py-3 text-muted-foreground">{institution.coordinator}</td>
                <td className="px-4 py-3 text-muted-foreground" dir="ltr">
                  {institution.phone}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {institution.supplier_name ?? "—"}
                </td>
                {showManageLinks ? (
                  <td className="px-4 py-3">
                    <InstitutionRowActions
                      institutionId={institution.id}
                      institutionName={institution.name}
                      showManageLinks={showManageLinks}
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
