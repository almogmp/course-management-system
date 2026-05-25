"use client";

import { useFormStatus } from "react-dom";
import { useRef } from "react";

type ConfirmSubmitButtonProps = {
  confirmMessage: string;
  idleLabel: string;
  pendingLabel?: string;
  className?: string;
  variant?: "danger" | "default";
};

const variantClassName = {
  danger:
    "border-red-200 bg-red-50 text-red-900 hover:bg-red-100 focus-visible:ring-red-400",
  default: "border-border bg-background text-foreground hover:bg-muted focus-visible:ring-primary",
};

export function ConfirmSubmitButton({
  confirmMessage,
  idleLabel,
  pendingLabel = "מעבד...",
  className = "",
  variant = "default",
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus();
  const confirmedRef = useRef(false);

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${variantClassName[variant]} ${className}`}
      onClick={(event) => {
        if (confirmedRef.current) {
          confirmedRef.current = false;
          return;
        }

        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }

        confirmedRef.current = true;
      }}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
