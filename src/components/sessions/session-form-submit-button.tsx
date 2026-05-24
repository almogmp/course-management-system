"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type Props = {
  idleLabel?: string;
  pendingLabel?: string;
  className?: string;
};

export function SessionFormSubmitButton({
  idleLabel = "שמירת מפגש",
  pendingLabel = "שומר...",
  className = "min-h-11 w-full sm:w-auto",
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
