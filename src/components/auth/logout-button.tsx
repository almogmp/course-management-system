"use client";

import { useTransition } from "react";

import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      className={className}
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void signOutAction();
        });
      }}
    >
      {pending ? "מתנתק..." : "התנתקות"}
    </Button>
  );
}
