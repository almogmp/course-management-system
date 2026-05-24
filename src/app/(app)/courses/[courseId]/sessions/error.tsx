"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

type CourseSessionsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CourseSessionsError({ error, reset }: CourseSessionsErrorProps) {
  return (
    <RouteErrorView
      error={error}
      reset={reset}
      title="לא ניתן לטעון את המפגשים"
    />
  );
}
