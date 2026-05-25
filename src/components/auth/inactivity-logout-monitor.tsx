"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  INACTIVITY_ACTIVITY_THROTTLE_MS,
  INACTIVITY_WARNING_BEFORE_MS,
  INACTIVITY_WARN_AT_MS,
} from "@/lib/auth/inactivity-config";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "touchstart", "scroll", "click"] as const;

export function InactivityLogoutMonitor() {
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const warnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastThrottleRef = useRef(0);
  const signingOutRef = useRef(false);
  const showWarningRef = useRef(false);

  useEffect(() => {
    showWarningRef.current = showWarning;
  }, [showWarning]);

  const clearTimers = useCallback(() => {
    if (warnTimeoutRef.current) {
      clearTimeout(warnTimeoutRef.current);
      warnTimeoutRef.current = null;
    }

    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  }, []);

  const signOutNow = useCallback(async () => {
    if (signingOutRef.current) {
      return;
    }

    signingOutRef.current = true;
    clearTimers();
    setShowWarning(false);

    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Continue to login even if sign-out request fails.
    }

    window.location.href = "/login?reason=inactivity";
  }, [clearTimers]);

  const scheduleTimers = useCallback(() => {
    clearTimers();

    warnTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      logoutTimeoutRef.current = setTimeout(() => {
        void signOutNow();
      }, INACTIVITY_WARNING_BEFORE_MS);
    }, INACTIVITY_WARN_AT_MS);
  }, [clearTimers, signOutNow]);

  const resetInactivityTimers = useCallback(() => {
    setShowWarning(false);
    scheduleTimers();
  }, [scheduleTimers]);

  const recordActivity = useCallback(() => {
    if (showWarningRef.current) {
      return;
    }

    const now = Date.now();

    if (now - lastThrottleRef.current < INACTIVITY_ACTIVITY_THROTTLE_MS) {
      return;
    }

    lastThrottleRef.current = now;
    scheduleTimers();
  }, [scheduleTimers]);

  useEffect(() => {
    resetInactivityTimers();
  }, [pathname, resetInactivityTimers]);

  useEffect(() => {
    scheduleTimers();

    const onActivity = () => {
      recordActivity();
    };

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, onActivity, { passive: true });
    }

    return () => {
      clearTimers();

      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, onActivity);
      }
    };
  }, [scheduleTimers, recordActivity, clearTimers]);

  return showWarning ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inactivity-logout-title"
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 text-start shadow-lg"
      >
        <h2 id="inactivity-logout-title" className="text-lg font-semibold text-foreground">
          התנתקות אוטומטית
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          בעוד דקה תתבצע התנתקות אוטומטית עקב חוסר פעילות.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
          <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={resetInactivityTimers}>
            הישאר מחובר
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full sm:w-auto"
            onClick={() => {
              void signOutNow();
            }}
          >
            התנתק עכשיו
          </Button>
        </div>
      </div>
    </div>
  ) : null;
}
