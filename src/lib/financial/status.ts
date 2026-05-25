import type { SessionStatus } from "@/components/sessions/constants";

/** Completed sessions only — counts toward actual revenue and payout. */
export function countsAsActualFinancial(status: SessionStatus): boolean {
  return status === "completed";
}

/**
 * Planned and in-progress sessions (excludes cancelled and deferred).
 * Includes completed for potential totals.
 */
export function countsAsPotentialFinancial(status: SessionStatus): boolean {
  return status !== "cancelled" && status !== "deferred";
}

export function countsAsDeferredFinancial(status: SessionStatus): boolean {
  return status === "deferred";
}

export function countsAsCancelledFinancial(status: SessionStatus): boolean {
  return status === "cancelled";
}
