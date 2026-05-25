"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { parseMonthParam } from "@/components/calendar/month-calendar-utils";
import { buildSessionsPageUrl } from "@/lib/sessions/sessions-page-url";

type SessionsMonthFilterProps = {
  monthParam: string;
  monthLabel: string;
};

const inputClassName =
  "min-h-11 w-full max-w-xs rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function SessionsMonthFilter({ monthParam, monthLabel }: SessionsMonthFilterProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <section
      aria-label="סינון לפי חודש"
      className="flex w-full flex-col items-center gap-3 rounded-xl border border-border bg-surface p-4 text-center md:flex-row md:items-end md:justify-between md:text-start"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">חודש נבחר</p>
        <p className="text-base font-semibold text-foreground">{monthLabel}</p>
      </div>
      <label className="flex w-full max-w-xs flex-col items-center gap-2 text-center md:items-start md:text-start">
        <span className="text-sm font-medium text-foreground">חודש</span>
        <input
          type="month"
          name="month"
          dir="ltr"
          disabled={pending}
          defaultValue={monthParam}
          className={inputClassName}
          onChange={(event) => {
            const value = event.target.value;

            if (!value) {
              return;
            }

            const monthView = parseMonthParam(value);

            startTransition(() => {
              router.push(buildSessionsPageUrl(monthView));
            });
          }}
        />
      </label>
    </section>
  );
}
