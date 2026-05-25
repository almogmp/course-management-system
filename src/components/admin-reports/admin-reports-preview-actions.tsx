"use client";

import Link from "next/link";
import { useEffect } from "react";

type AdminReportsPreviewActionsProps = {
  backHref: string;
  autoPrint?: boolean;
};

const buttonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted";

export function AdminReportsPreviewActions({
  backHref,
  autoPrint = false,
}: AdminReportsPreviewActionsProps) {
  useEffect(() => {
    if (autoPrint) {
      window.print();
    }
  }, [autoPrint]);

  return (
    <div className="flex flex-wrap justify-center gap-2 print-hidden">
      <button type="button" className={buttonClassName} onClick={() => window.print()}>
        הדפס / שמור כ-PDF
      </button>
      <Link href={backHref} className={buttonClassName}>
        חזרה לדוחות
      </Link>
    </div>
  );
}
