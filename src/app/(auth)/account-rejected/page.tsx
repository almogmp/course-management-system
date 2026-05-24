import Link from "next/link";

import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export default function AccountRejectedPage() {
  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <h1 className="text-2xl font-bold text-foreground">הבקשה נדחתה</h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        לא ניתן להיכנס למערכת. לפרטים נוספים פנה למנהל המערכת.
      </p>
      <form action={signOutAction}>
        <Button type="submit" variant="secondary" className="w-full">
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
