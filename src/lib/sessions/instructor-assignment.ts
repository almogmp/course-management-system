/** מיפוי מדריך נבחר ל-substitute_instructor_id לפי הסכמה הקיימת */
export function resolveSessionSubstituteInstructorId(
  selectedInstructorId: string,
  courseLeadInstructorId: string,
): string | null {
  if (selectedInstructorId === courseLeadInstructorId) {
    return null;
  }

  return selectedInstructorId;
}

export function getEffectiveInstructorId(
  substituteInstructorId: string | null,
  courseLeadInstructorId: string,
): string {
  return substituteInstructorId ?? courseLeadInstructorId;
}
