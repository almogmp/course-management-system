import Link from "next/link";
import { notFound } from "next/navigation";

import { seedDemoDataAction } from "@/app/(app)/admin/seed/actions";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/guards";
import { isAdminSeedEnabled } from "@/lib/env/app-env";

type AdminSeedPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
  };
};

export default async function AdminSeedPage({ searchParams }: AdminSeedPageProps) {
  if (!isAdminSeedEnabled()) {
    notFound();
  }

  await requireAdmin();

  const showSuccess = searchParams?.success === "1";
  const errorMessage =
    typeof searchParams?.error === "string"
      ? decodeURIComponent(searchParams.error)
      : null;

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-start">
        <Link
          href="/dashboard"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          חזרה ללוח הבקרה
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">נתוני דמו</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          יצירת רשומות בסיסיות לפיתוח ובדיקות — מוסד, ספק ראשי ומדריך.
        </p>
      </header>

      {showSuccess ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          נתוני הדמו נוצרו בהצלחה.
        </p>
      ) : null}

      {errorMessage ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          הפעולה תיצור רק רשומות שחסרות: מוסד אחד, ספק ראשי אחד, ומדריך המקושר למשתמש
          המחובר.
        </p>
        <form action={seedDemoDataAction}>
          <Button type="submit" className="w-full sm:w-auto">
            יצירת נתוני דמו
          </Button>
        </form>
      </section>
    </Container>
  );
}
