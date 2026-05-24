import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardShell } from "@/components/layout/dashboard-shell";

type AppLayoutProps = {
  children: ReactNode;
};

/** אזור מחובר — מעטפת עם כותרת, sidebar ותפריט */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AppShell>
      <DashboardShell>{children}</DashboardShell>
    </AppShell>
  );
}
