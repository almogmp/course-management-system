import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  className?: string;
};

/** מעטפת האפליקציה — כותרת, תוכן ראשי ותחתית */
export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col", className)}>
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
