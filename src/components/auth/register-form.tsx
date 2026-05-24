"use client";

import Link from "next/link";
import { useState } from "react";

import { registerInstructorAction } from "@/app/auth/registration-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RegisterFormProps = {
  className?: string;
};

function getPendingApprovalUrl(needsEmailConfirmation: boolean): string {
  if (needsEmailConfirmation) {
    return "/pending-approval?registered=confirm_email";
  }
  return "/pending-approval?registered=success";
}

export function RegisterForm({ className }: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }

    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerInstructorAction({
        fullName,
        phone,
        email,
        password,
      });

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // הצלחה — מעבר מלא לדף המתנה (ללא ריענון שמאפס את הטופס)
      window.location.assign(getPendingApprovalUrl(result.needsEmailConfirmation));
    } catch {
      setError("אירעה שגיאה בלתי צפויה. נסה שוב.");
      setLoading(false);
    }
  }

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">יצירת חשבון</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          הרשמה כמדריך — לאחר שליחת הטופס הבקשה תועבר לאישור מנהל
        </p>
      </header>

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
            שם מלא
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            className="min-h-11 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-foreground">
            טלפון
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            dir="ltr"
            className="min-h-11 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            דוא&quot;ל
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            dir="ltr"
            placeholder="name@example.com"
            className="min-h-11 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            סיסמה
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            dir="ltr"
            className="min-h-11 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-foreground"
          >
            אימות סיסמה
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            dir="ltr"
            className="min-h-11 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          className="min-h-11 w-full text-base"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "שולח בקשה..." : "יצירת חשבון"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        כבר יש לך חשבון?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          התחברות
        </Link>
      </p>
    </div>
  );
}
