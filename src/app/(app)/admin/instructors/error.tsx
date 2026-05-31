"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Container } from "@/components/ui/container";

type AdminInstructorsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminInstructorsError({ error, reset }: AdminInstructorsErrorProps) {
  useEffect(() => {
    console.error("ADMIN_INSTRUCTORS_PROFILE_QUERY", {
      context: "AdminInstructorsError",
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <Container as="main" className="flex flex-1 flex-col gap-6 py-8">
      <header className="space-y-2 text-start">
        <Link
          href="/dashboard"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          חזרה לדשבורד
        </Link>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">ניהול מדריכים</h1>
      </header>
      <p
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        role="alert"
      >
        לא ניתן לטעון את דף ניהול המדריכים. נסו לרענן. אם הבעיה נמשכת, בדקו את מפתח השירות
        ב-Vercel.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-10 w-fit items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        נסה שוב
      </button>
    </Container>
  );
}
