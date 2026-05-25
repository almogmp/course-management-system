import type { SessionStatus } from "@/components/sessions/constants";
import {
  countsAsActualFinancial,
  countsAsPotentialFinancial,
} from "@/lib/financial/status";

export type CourseRateDefaults = {
  institutionHourlyRate: number;
  instructorHourlyRate: number;
};

export type SessionRateOverrides = {
  institutionHourlyRate: number | null;
  instructorHourlyRate: number | null;
};

export type SessionFinancialInput = {
  status: SessionStatus;
  instructor_hours: number;
  company_hours: number;
  course: CourseRateDefaults;
  overrides: SessionRateOverrides;
};

export type SessionFinancialBreakdown = {
  effectiveInstitutionHourlyRate: number;
  effectiveInstructorHourlyRate: number;
  missingInstitutionRate: boolean;
  missingInstructorRate: boolean;
  potentialRevenue: number;
  actualRevenue: number;
  potentialInstructorPayout: number;
  actualInstructorPayout: number;
  potentialProfit: number;
  actualProfit: number;
};

export function getEffectiveRatesFromParts(
  course: CourseRateDefaults,
  overrides: SessionRateOverrides,
): {
  effectiveInstitutionHourlyRate: number;
  effectiveInstructorHourlyRate: number;
  missingInstitutionRate: boolean;
  missingInstructorRate: boolean;
} {
  const effectiveInstitutionHourlyRate =
    overrides.institutionHourlyRate !== null && overrides.institutionHourlyRate !== undefined
      ? overrides.institutionHourlyRate
      : (course.institutionHourlyRate ?? 0);

  const effectiveInstructorHourlyRate =
    overrides.instructorHourlyRate !== null && overrides.instructorHourlyRate !== undefined
      ? overrides.instructorHourlyRate
      : (course.instructorHourlyRate ?? 0);

  return {
    effectiveInstitutionHourlyRate,
    effectiveInstructorHourlyRate,
    missingInstitutionRate: effectiveInstitutionHourlyRate <= 0,
    missingInstructorRate: effectiveInstructorHourlyRate <= 0,
  };
}

export function computeSessionFinancials(input: SessionFinancialInput): SessionFinancialBreakdown {
  return computeSessionFinancialsFromParts(
    {
      status: input.status,
      instructor_hours: input.instructor_hours,
      company_hours: input.company_hours,
    },
    input.course,
    input.overrides,
  );
}

export function computeSessionFinancialsFromParts(
  session: {
    status: SessionStatus;
    instructor_hours: number;
    company_hours: number;
  },
  course: CourseRateDefaults,
  overrides: SessionRateOverrides,
): SessionFinancialBreakdown {
  const {
    effectiveInstitutionHourlyRate,
    effectiveInstructorHourlyRate,
    missingInstitutionRate,
    missingInstructorRate,
  } = getEffectiveRatesFromParts(course, overrides);

  const potentialRevenue = countsAsPotentialFinancial(session.status)
    ? session.company_hours * effectiveInstitutionHourlyRate
    : 0;

  const actualRevenue = countsAsActualFinancial(session.status)
    ? session.company_hours * effectiveInstitutionHourlyRate
    : 0;

  const potentialInstructorPayout = countsAsPotentialFinancial(session.status)
    ? session.instructor_hours * effectiveInstructorHourlyRate
    : 0;

  const actualInstructorPayout = countsAsActualFinancial(session.status)
    ? session.instructor_hours * effectiveInstructorHourlyRate
    : 0;

  return {
    effectiveInstitutionHourlyRate,
    effectiveInstructorHourlyRate,
    missingInstitutionRate,
    missingInstructorRate,
    potentialRevenue,
    actualRevenue,
    potentialInstructorPayout,
    actualInstructorPayout,
    potentialProfit: potentialRevenue - potentialInstructorPayout,
    actualProfit: actualRevenue - actualInstructorPayout,
  };
}

export function sumFinancialBreakdowns(
  breakdowns: SessionFinancialBreakdown[],
): Omit<
  SessionFinancialBreakdown,
  | "effectiveInstitutionHourlyRate"
  | "effectiveInstructorHourlyRate"
  | "missingInstitutionRate"
  | "missingInstructorRate"
> {
  return breakdowns.reduce(
    (acc, row) => ({
      potentialRevenue: acc.potentialRevenue + row.potentialRevenue,
      actualRevenue: acc.actualRevenue + row.actualRevenue,
      potentialInstructorPayout: acc.potentialInstructorPayout + row.potentialInstructorPayout,
      actualInstructorPayout: acc.actualInstructorPayout + row.actualInstructorPayout,
      potentialProfit: acc.potentialProfit + row.potentialProfit,
      actualProfit: acc.actualProfit + row.actualProfit,
    }),
    {
      potentialRevenue: 0,
      actualRevenue: 0,
      potentialInstructorPayout: 0,
      actualInstructorPayout: 0,
      potentialProfit: 0,
      actualProfit: 0,
    },
  );
}

/** Map DB course columns to financial course defaults. */
export function courseRatesFromDb(course: {
  company_hourly_rate: number;
  instructor_hourly_wage: number;
}): CourseRateDefaults {
  return {
    institutionHourlyRate: course.company_hourly_rate,
    instructorHourlyRate: course.instructor_hourly_wage,
  };
}

export function sessionOverridesFromDb(session: {
  institution_hourly_rate: number | null;
  instructor_hourly_rate: number | null;
}): SessionRateOverrides {
  return {
    institutionHourlyRate: session.institution_hourly_rate,
    instructorHourlyRate: session.instructor_hourly_rate,
  };
}
