import type { ReactNode } from "react";

import { InactivityLogoutMonitor } from "@/components/auth/inactivity-logout-monitor";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getAuthSnapshot } from "@/lib/auth/session";

type AppLayoutProps = {
  children: ReactNode;
};

/** אזור מחובר — מעטפת עם כותרת, sidebar ותפריט */
export default async function AppLayout({ children }: AppLayoutProps) {
  const { user } = await getAuthSnapshot();

  return (
    <AppShell>
      {user ? <InactivityLogoutMonitor /> : null}
      <DashboardShell>{children}</DashboardShell>
    </AppShell>
  );
}
