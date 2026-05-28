import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { getAuthSnapshot } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

const publicNavItems: NavItem[] = [
  { href: "/", label: "דף הבית" },
];

const instructorNavItems: NavItem[] = [
  { href: "/courses", label: "קורסים" },
  { href: "/sessions", label: "מפגשים" },
];

const adminNavItems: NavItem[] = [
  { href: "/admin/reports", label: "דוחות" },
  { href: "/admin/expenses", label: "הוצאות" },
  { href: "/admin/instructors", label: "מדריכים" },
  { href: "/admin/payroll", label: "שכר" },
  { href: "/admin/instructor-approvals", label: "אישורי מדריכים" },
  { href: "/institutions", label: "מוסדות" },
  { href: "/suppliers", label: "ספקים" },
];

type SiteHeaderProps = {
  className?: string;
};

export async function SiteHeader({ className }: SiteHeaderProps) {
  const { user, isAdmin } = await getAuthSnapshot();
  const homeHref = user ? "/dashboard" : "/";

  const navItems = [
    ...(user ? [] : publicNavItems),
    ...(user ? instructorNavItems : []),
    ...(isAdmin ? adminNavItems : []),
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80",
        className,
      )}
    >
      <Container className="flex min-h-14 items-center justify-between gap-4 py-3 sm:min-h-16">
        <Link href={homeHref} className="text-base font-bold text-foreground sm:text-lg">
          {siteConfig.name}
        </Link>

        <nav aria-label="ניווט ראשי" className="flex items-center gap-2 sm:gap-3">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-4 sm:text-base"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-muted sm:text-base"
              >
                {isAdmin ? "מנהל" : "אזור אישי"}
              </Link>

              <LogoutButton className="min-h-9 px-3 text-sm" />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:px-4 sm:text-base"
            >
              התחברות
            </Link>
          )}
        </nav>
      </Container>
    </header>
  );
}