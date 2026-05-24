"use client";

import { useFormStatus } from "react-dom";

import { deleteSessionAction } from "@/app/(app)/courses/[courseId]/sessions/actions";

type DeleteSessionButtonProps = {
  courseId: string;
  sessionId: string;
};

function DeleteSessionSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-800 transition-colors hover:bg-red-100 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "מוחק..." : "מחיקה"}
    </button>
  );
}

export function DeleteSessionButton({ courseId, sessionId }: DeleteSessionButtonProps) {
  const deleteSession = deleteSessionAction.bind(null, courseId);

  return (
    <form
      action={deleteSession}
      className="inline"
      onSubmit={(event) => {
        if (
          !window.confirm("האם למחוק את המפגש? פעולה זו אינה ניתנת לביטול.")
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="session_id" value={sessionId} />
      <DeleteSessionSubmitButton />
    </form>
  );
}
