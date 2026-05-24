import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

type MarketingLayoutProps = {
  children: ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
