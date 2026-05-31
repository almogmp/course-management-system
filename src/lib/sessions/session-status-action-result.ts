export type SessionStatusActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

export const STATUS_UPDATE_GENERIC_ERROR = "עדכון הסטטוס נכשל. נסה שוב.";

export function sessionStatusFailure(error: string): SessionStatusActionResult {
  return { ok: false, error };
}

export function sessionStatusSuccess(message?: string): SessionStatusActionResult {
  return message ? { ok: true, message } : { ok: true };
}

/** Safe client-side check after awaiting a server action. */
export function isSessionStatusActionFailure(
  result: SessionStatusActionResult | null | undefined,
): result is SessionStatusActionResult & { ok: false } {
  return !result || result.ok !== true;
}
