"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  approveInstructorAction,
  rejectInstructorAction,
} from "@/app/auth/registration-actions";
import { Button } from "@/components/ui/button";

type InstructorApprovalActionsProps = {
  profileId: string;
};

export function InstructorApprovalActions({ profileId }: InstructorApprovalActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveInstructorAction(profileId);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectInstructorAction(profileId);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
      <Button
        type="button"
        className="min-h-11 flex-1"
        disabled={pending}
        onClick={handleApprove}
      >
        {pending ? "מעבד..." : "אישור"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="min-h-11 flex-1"
        disabled={pending}
        onClick={handleReject}
      >
        דחייה
      </Button>
    </div>
  );
}
