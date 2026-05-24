"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  return <RouteErrorView error={error} reset={reset} />;
}
