"use client";

import {
  SESSION_STATUS_FILTERS,
  type SessionStatusFilter,
} from "@/components/sessions/constants";
import { cn } from "@/lib/utils";

type CourseSessionsFiltersProps = {
  value: SessionStatusFilter;
  onChange: (value: SessionStatusFilter) => void;
};

export function CourseSessionsFilters({ value, onChange }: CourseSessionsFiltersProps) {
  return (
    <div
      role="tablist"
      aria-label="סינון לפי סטטוס"
      className="flex flex-wrap gap-2"
    >
      {SESSION_STATUS_FILTERS.map((filter) => {
        const isActive = value === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter.value)}
            className={cn(
              "inline-flex min-h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-foreground hover:bg-muted",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
