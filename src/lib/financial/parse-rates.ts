export function parseOptionalRate(
  raw: string,
  fieldLabel: string,
): { ok: true; value: number | null } | { ok: false; error: string } {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { ok: true, value: null };
  }

  const value = Number(trimmed);

  if (Number.isNaN(value) || value < 0) {
    return { ok: false, error: `${fieldLabel} חייב להיות מספר שאינו שלילי.` };
  }

  return { ok: true, value };
}

export function parseRequiredRate(
  raw: string,
  fieldLabel: string,
): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { ok: false, error: `יש למלא ${fieldLabel}.` };
  }

  const value = Number(trimmed);

  if (Number.isNaN(value) || value < 0) {
    return { ok: false, error: `${fieldLabel} חייב להיות מספר שאינו שלילי.` };
  }

  return { ok: true, value };
}
