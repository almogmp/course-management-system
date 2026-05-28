import Link from "next/link";
import type { ReactNode } from "react";

import { getAuthSnapshot } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: ReactNode;
  className?: string;
};

const baseNavItems = [
  { href: "/dashboard", label: "דשבורד" },
  { href: "/courses", label: "קורסים" },
  { href: "/sessions", label: "מפגשים" },
] as const;

const adminNavItems = [
  { href: "/admin/courses/with-sessions", label: "קורס + מפגשים" },
  { href: "/admin/reports", label: "דוחות" },
  { href: "/admin/expenses", label: "הוצאות" },
  { href: "/admin/instructors", label: "מדריכים" },
  { href: "/admin/payroll", label: "שכר" },
  { href: "/institutions", label: "מוסדות" },
  { href: "/suppliers", label: "ספקים" },
] as const;

export async function DashboardShell({ children, className }: DashboardShellProps) {
  const { isAdmin } = await getAuthSnapshot();
  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : [...baseNavItems];

  return (
    <div
      className={cn("flex min-h-dvh flex-col bg-background lg:flex-row", className)}
    >
      <main className="order-1 min-w-0 flex-1 lg:order-2">{children}</main>

      <aside className="order-2 w-full shrink-0 border-border bg-surface lg:order-1 lg:w-56 lg:border-b-0 lg:border-s">
        <nav aria-label="תפריט צד" className="p-4 lg:min-h-dvh lg:p-5">
          <p className="mb-4 hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">
            ניווט
          </p>
          <ul className="flex flex-row flex-wrap gap-1 lg:flex-col lg:gap-0.5">
            {navItems.map((item) => (
              <li key={item.href} className="lg:w-full">
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-base lg:min-h-11 lg:px-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
