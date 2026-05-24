"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getPostAuthPath } from "@/lib/auth/redirects";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  nextPath?: string;
  initialError?: string | null;
  className?: string;
};

export function LoginForm({
  nextPath = "/dashboard",
  initialError = null,
  className,
}: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("לא נמצא משתמש מחובר לאחר ההתחברות.");
      return;
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("role, approval_status")
      .eq("id", user.id)
      .single();

    const profile = profileRow
      ? {
          role: profileRow.role,
          approval_status: profileRow.approval_status,
        }
      : null;

    setLoading(false);

    router.refresh();
    router.push(getPostAuthPath(profile, nextPath));
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    setLoading(false);

    if (oauthError) {
      setError(oauthError.message);
    }
  }

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          התחברות
        </h1>

        <p className="text-sm text-muted-foreground sm:text-base">
          התחברות עם מייל וסיסמה או עם Google
        </p>
      </header>

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground"
          >
            סיסמה
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            dir="ltr"
            className="min-h-11 w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          className="min-h-11 w-full text-base"
          disabled={loading}
        >
          {loading ? "מתחבר..." : "התחברות"}
        </Button>
      </form>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-border" />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            או
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="min-h-11 w-full text-base"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        התחברות עם Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        אין לך חשבון?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          יצירת חשבון
        </Link>
      </p>
    </div>
  );
}