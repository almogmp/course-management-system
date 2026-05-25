import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  } | null;
  children?: ReactNode;
};

/**
 * כותרת דף עם פעולת מנהל — במובייל הכפתור תמיד מתחת לכותרת, ברוחב מלא.
 * מ־md ומעלה: שורה אחת עם כפתור בצד (כמו דסקטופ קודם).
 */
export function AdminPageHeader({ title, description, action, children }: AdminPageHeaderProps) {
  return (
    <header className="flex w-full min-w-0 flex-col gap-4 overflow-visible md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 space-y-2 text-start">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>

      {action ? (
        <div className="w-full shrink-0 md:w-auto">
          <ButtonLink
            href={action.href}
            className={cn(
              "flex w-full min-h-11 items-center justify-center",
              "md:inline-flex md:w-auto",
            )}
          >
            {action.label}
          </ButtonLink>
        </div>
      ) : null}

      {children}
    </header>
  );
}
