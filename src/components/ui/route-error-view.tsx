"use client";

import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { getSafeErrorMessage } from "@/lib/errors/safe-error-message";

type RouteErrorViewProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  homeHref?: string;
};

export function RouteErrorView({
  error,
  reset,
  title = "משהו השתבש",
  homeHref = "/dashboard",
}: RouteErrorViewProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message = getSafeErrorMessage(error);

  return (
    <Container as="main" className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">{message}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          נסה שוב
        </button>
        <ButtonLink href={homeHref} variant="secondary">
          חזרה לדשבורד
        </ButtonLink>
      </div>
    </Container>
  );
}
