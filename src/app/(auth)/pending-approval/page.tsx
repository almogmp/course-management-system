import Link from "next/link";

import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

type PendingApprovalPageProps = {
  searchParams?: {
    registered?: string;
  };
};

export default function PendingApprovalPage({ searchParams }: PendingApprovalPageProps) {
  const registered = searchParams?.registered;
  const needsEmailConfirm = registered === "confirm_email";
  const showRegistrationSuccess =
    registered === "success" || registered === "1" || needsEmailConfirm;

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      {showRegistrationSuccess ? (
        <p
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-900"
          role="status"
        >
          {needsEmailConfirm
            ? "ההרשמה התקבלה. אשר את כתובת הדוא\"ל שנשלחה אליך."
            : "ההרשמה הושלמה בהצלחה."}
        </p>
      ) : null}

      <h1 className="text-2xl font-bold text-foreground">ממתין לאישור</h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        הבקשה הועברה למנהל. לאחר אישור תוכל להיכנס לאפליקציה.
      </p>
      {needsEmailConfirm ? (
        <p className="text-sm text-muted-foreground">
          לאחר אימות הדוא&quot;ל, המנהל יאשר את הבקשה ותוכל להתחבר.
        </p>
      ) : null}
      <form action={signOutAction}>
        <Button type="submit" variant="secondary" className="min-h-11 w-full">
          התנתקות
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          חזרה להתחברות
        </Link>
      </p>
    </div>
  );
}
