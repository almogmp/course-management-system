import Link from "next/link";
import { cn } from "@/lib/utils";

type InlineErrorPanelProps = {
  title: string;
  message?: string;
  retryHref?: string;
  retryLabel?: string;
  className?: string;
};

export function InlineErrorPanel({
  title,
  message = "נסו לרענן את הדף. אם הבעיה נמשכת, פנו למנהל המערכת.",
  retryHref,
  retryLabel = "נסה שוב",
  className,
}: InlineErrorPanelProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-red-200 bg-red-50/80 px-4 py-5 text-start sm:px-6",
        className,
      )}
    >
      <p className="text-sm font-semibold text-red-950">{title}</p>
      <p className="mt-1 text-sm text-red-900">{message}</p>
      {retryHref ? (
        <div className="mt-4">
          <Link
            href={retryHref}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {retryLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
