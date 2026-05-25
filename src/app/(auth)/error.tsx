"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

type AuthErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AuthError({ error, reset }: AuthErrorProps) {
  return (
    <RouteErrorView
      error={error}
      reset={reset}
      title="שגיאה בהתחברות"
      homeHref="/login"
    />
  );
}
