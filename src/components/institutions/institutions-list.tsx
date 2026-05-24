import Link from "next/link";

import type { InstitutionListItem } from "@/components/institutions/get-institutions";

type InstitutionsListProps = {
  institutions: InstitutionListItem[];
  showManageLinks?: boolean;
};

export function InstitutionsList({
  institutions,
  showManageLinks = false,
}: InstitutionsListProps) {
  return (
    <>
      <ul className="space-y-3 md:hidden">
        {institutions.map((institution) => (
          <li
            key={institution.id}
            className="rounded-xl border border-border bg-surface p-4 text-start"
          >
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">{institution.name}</h2>
              <p className="text-sm text-muted-foreground">{institution.city}</p>
              <p className="text-sm text-muted-foreground">
                רכז: {institution.coordinator}
              </p>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {institution.phone}
              </p>
              {showManageLinks ? (
                <Link
                  href={`/institutions/${institution.id}`}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
                >
                  ניהול רכזים
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
        <table className="w-full min-w-[640px] text-start text-sm">
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
                {showManageLinks ? (
                  <td className="px-4 py-3">
                    <Link
                      href={`/institutions/${institution.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      ניהול רכזים
                    </Link>
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
