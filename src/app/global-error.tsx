"use client";

import { RouteErrorView } from "@/components/ui/route-error-view";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="he" dir="rtl">
      <body className="font-sans antialiased">
        <RouteErrorView
          error={error}
          reset={reset}
          title="שגיאה במערכת"
          homeHref="/"
        />
      </body>
    </html>
  );
}
