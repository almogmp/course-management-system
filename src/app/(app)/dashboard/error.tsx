"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <RouteErrorView
      error={error}
      reset={reset}
      title="לא ניתן לטעון את הדשבורד"
    />
  );
}
