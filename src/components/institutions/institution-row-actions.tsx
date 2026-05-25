import Link from "next/link";

import { AdminDeleteDialog } from "@/components/admin/admin-delete-dialog";
import { MOBILE_CARD_ACTIONS_CLASS, TABLE_ROW_ACTIONS_CLASS } from "@/components/ui/mobile-card-classes";
import { cn } from "@/lib/utils";

type InstitutionRowActionsProps = {
  institutionId: string;
  institutionName: string;
  showManageLinks: boolean;
  variant?: "card" | "table";
};

/** פעולות שורת מוסד — משותף למובייל ולדסקטופ. */
export function InstitutionRowActions({
  institutionId,
  institutionName,
  showManageLinks,
  variant = "table",
}: InstitutionRowActionsProps) {
  if (!showManageLinks) {
    return null;
  }

  const wrapClass = variant === "card" ? MOBILE_CARD_ACTIONS_CLASS : TABLE_ROW_ACTIONS_CLASS;

  return (
    <div className={cn(wrapClass, "app-table-actions")}>
      <Link
        href={`/institutions/${institutionId}`}
        className={
          variant === "card"
            ? "inline-flex min-h-10 w-full max-w-xs items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
            : "font-medium text-primary underline-offset-4 hover:underline"
        }
      >
        ניהול מוסד
      </Link>
      <AdminDeleteDialog
        entityType="institution"
        entityId={institutionId}
        entityLabel={institutionName}
        returnPath="/institutions"
        triggerLabel={variant === "card" ? "מחק מוסד" : "מחק"}
        compact={variant === "table"}
      />
    </div>
  );
}
