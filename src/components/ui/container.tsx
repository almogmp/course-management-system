import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "main" | "section";
};

/**
 * מיכל תוכן רספונסיבי — Mobile First.
 * שוליים ורוחב מקסימלי מוגדרים לפי נקודות שבירה (sm → lg).
 */
export function Container({
  as: Component = "div",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        Component === "main" && "py-6 sm:py-8",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
