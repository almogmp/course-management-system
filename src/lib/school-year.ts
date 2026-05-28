import { toLocalDateKey } from "@/lib/date/week";

export type SchoolYear = {
  startYear: number;
  endYear: number;
  startDate: string;
  endDate: string;
  label: string;
};

export function getCurrentSchoolYearStartYear(now: Date = new Date()): number {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // School year starts Sep 1st.
  return month >= 9 ? year : year - 1;
}

export function getSchoolYear(startYear: number): SchoolYear {
  const endYear = startYear + 1;
  const startDate = toLocalDateKey(new Date(startYear, 8, 1)); // 01.09.YYYY
  const endDate = toLocalDateKey(new Date(endYear, 7, 31)); // 31.08.YYYY+1

  return {
    startYear,
    endYear,
    startDate,
    endDate,
    label: `${startYear}-${endYear}`,
  };
}

export function buildSchoolYearOptions(currentStartYear: number, range: number = 3): SchoolYear[] {
  const years: SchoolYear[] = [];
  for (let y = currentStartYear - range; y <= currentStartYear + 1; y += 1) {
    years.push(getSchoolYear(y));
  }
  return years;
}

