const UNASSIGNED_LABEL = "לא שובץ";

export function resolveSessionInstructorDisplayName(input: {
  substituteInstructorId: string | null;
  substituteName: string | null | undefined;
  leadInstructorId: string;
  leadName: string | null | undefined;
  nameById?: Map<string, string>;
}): string {
  if (input.substituteInstructorId) {
    const fromJoin = input.substituteName?.trim();
    if (fromJoin) {
      return fromJoin;
    }

    const fromMap = input.nameById?.get(input.substituteInstructorId)?.trim();
    if (fromMap) {
      return fromMap;
    }

    return UNASSIGNED_LABEL;
  }

  if (input.leadInstructorId) {
    const fromJoin = input.leadName?.trim();
    if (fromJoin) {
      return fromJoin;
    }

    const fromMap = input.nameById?.get(input.leadInstructorId)?.trim();
    if (fromMap) {
      return fromMap;
    }

    return UNASSIGNED_LABEL;
  }

  return UNASSIGNED_LABEL;
}
