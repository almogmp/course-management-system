import type { ReactNode } from "react";

import {
  MOBILE_CARD_ACTIONS_CLASS,
  MOBILE_CARD_BODY_CLASS,
  MOBILE_CARD_FIELD_EMPHASIS_CLASS,
  MOBILE_CARD_FIELD_LABEL_CLASS,
  MOBILE_CARD_FIELD_VALUE_CLASS,
  MOBILE_CARD_ITEM_CLASS,
} from "@/components/ui/mobile-card-classes";
import { cn } from "@/lib/utils";

type MobileCardProps = {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
};

export function MobileCard({ children, className, highlight = false }: MobileCardProps) {
  return (
    <li
      className={cn(
        MOBILE_CARD_ITEM_CLASS,
        "mobile-card",
        highlight && "border-primary ring-2 ring-primary/20",
        className,
      )}
    >
      {children}
    </li>
  );
}

export function MobileCardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(MOBILE_CARD_BODY_CLASS, "mobile-card-body", className)}>{children}</div>;
}

type MobileCardFieldProps = {
  label?: string;
  value: ReactNode;
  emphasize?: boolean;
  dir?: "ltr" | "rtl";
};

export function MobileCardField({ label, value, emphasize = false, dir }: MobileCardFieldProps) {
  return (
    <p className={cn("mobile-card-field", emphasize ? MOBILE_CARD_FIELD_EMPHASIS_CLASS : MOBILE_CARD_FIELD_VALUE_CLASS)}>
      {label ? <span className={MOBILE_CARD_FIELD_LABEL_CLASS}>{label}</span> : null}
      <span dir={dir}>{value}</span>
    </p>
  );
}

export function MobileCardActions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(MOBILE_CARD_ACTIONS_CLASS, "mobile-card-actions", className)}>{children}</div>
  );
}
