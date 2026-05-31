import { getCurrentSchoolYearStartYear, getSchoolYear } from "@/lib/school-year";

/** Parse school year from form (`2025` or `2025-2026` label). Defaults to current school year. */
export function parseSchoolYearFromForm(formData: FormData): string {
  const raw = String(formData.get("school_year") ?? "").trim();

  if (/^\d{4}-\d{4}$/.test(raw)) {
    return raw;
  }

  const startYear = Number(raw);

  if (Number.isInteger(startYear) && startYear >= 2000 && startYear <= 2100) {
    return getSchoolYear(startYear).label;
  }

  return getSchoolYear(getCurrentSchoolYearStartYear()).label;
}
