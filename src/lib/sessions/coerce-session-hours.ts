/** Normalize instructor_hours from PostgREST (number, string, or null). */
export function coerceSessionHours(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
