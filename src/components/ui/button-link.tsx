import Link from "next/link";
import type { ComponentProps } from "react";

import {
  buttonSizeStyles,
  buttonVariantStyles,
  type ButtonProps,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentProps<typeof Link> &
  Pick<ButtonProps, "variant" | "size">;

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        baseStyles,
        buttonVariantStyles[variant],
        buttonSizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
