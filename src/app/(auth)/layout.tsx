import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

type AuthLayoutProps = {
  children: ReactNode;
};

/** מעטפת מינימלית לדפי התחברות — ללא תפריט ראשי */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border py-4">
        <Container>
          <p className="text-center text-base font-bold text-foreground sm:text-lg">
            {siteConfig.name}
          </p>
        </Container>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
