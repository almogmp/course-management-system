import { roundMoney } from "@/lib/financial/round-money";
import { VAT_DIVISOR } from "@/lib/financial/vat";

export type RateSource = "session" | "course" | "none";

export type SessionRateInput = {
  sessionInstitutionHourlyRate: number | null;
  sessionInstructorHourlyRate: number | null;
  courseCompanyHourlyRate: number | null;
  courseInstructorHourlyWage: number | null;
};

export type ResolvedSessionRates = {
  companyRate: number;
  instructorRate: number;
  companyRateSource: RateSource;
  instructorRateSource: RateSource;
  missingCompanyRate: boolean;
  missingInstructorRate: boolean;
};

export type CompletedSessionMoney = {
  grossRevenue: number;
  vat: number;
  instructorCost: number;
  grossProfit: number;
};

function positiveRate(value: number | null | undefined): number | null {
  if (value == null || value <= 0) {
    return null;
  }

  return value;
}

function resolveSingleRate(
  sessionRate: number | null,
  courseRate: number | null,
): { rate: number; source: RateSource } {
  const session = positiveRate(sessionRate);
  if (session != null) {
    return { rate: session, source: "session" };
  }

  const course = positiveRate(courseRate);
  if (course != null) {
    return { rate: course, source: "course" };
  }

  return { rate: 0, source: "none" };
}

/**
 * Shared rate resolver for all financial outputs.
 *
 * Company rate priority:
 * 1. sessions.institution_hourly_rate (when > 0)
 * 2. courses.company_hourly_rate
 * 3. 0 only when no positive rate exists anywhere
 *
 * Instructor rate priority:
 * 1. sessions.instructor_hourly_rate (when > 0)
 * 2. courses.instructor_hourly_wage
 * 3. 0 only when no positive rate exists anywhere
 *
 * Session rates of null or 0 fall through to course defaults.
 */
export function resolveSessionRates(input: SessionRateInput): ResolvedSessionRates {
  const company = resolveSingleRate(
    input.sessionInstitutionHourlyRate,
    input.courseCompanyHourlyRate,
  );
  const instructor = resolveSingleRate(
    input.sessionInstructorHourlyRate,
    input.courseInstructorHourlyWage,
  );

  return {
    companyRate: company.rate,
    instructorRate: instructor.rate,
    companyRateSource: company.source,
    instructorRateSource: instructor.source,
    missingCompanyRate: company.rate <= 0,
    missingInstructorRate: instructor.rate <= 0,
  };
}

export function courseRatesFromDb(course: {
  company_hourly_rate: number | null;
  instructor_hourly_wage: number | null;
}): Pick<SessionRateInput, "courseCompanyHourlyRate" | "courseInstructorHourlyWage"> {
  return {
    courseCompanyHourlyRate: course.company_hourly_rate,
    courseInstructorHourlyWage: course.instructor_hourly_wage,
  };
}

export function sessionRatesFromDb(session: {
  institution_hourly_rate: number | null;
  instructor_hourly_rate: number | null;
}): Pick<SessionRateInput, "sessionInstitutionHourlyRate" | "sessionInstructorHourlyRate"> {
  return {
    sessionInstitutionHourlyRate: session.institution_hourly_rate,
    sessionInstructorHourlyRate: session.instructor_hourly_rate,
  };
}

export type CompletedSessionFinancialInput = SessionRateInput & {
  company_hours: number;
  instructor_hours: number;
};

export function computeCompletedSessionMoney(
  input: CompletedSessionFinancialInput,
): CompletedSessionMoney & { rates: ResolvedSessionRates } {
  const rates = resolveSessionRates(input);

  const grossRevenue = roundMoney(input.company_hours * rates.companyRate);
  const instructorCost = roundMoney(input.instructor_hours * rates.instructorRate);
  const vat = roundMoney(grossRevenue - grossRevenue / VAT_DIVISOR);
  const grossProfit = roundMoney(grossRevenue - vat - instructorCost);

  return {
    grossRevenue,
    vat,
    instructorCost,
    grossProfit,
    rates,
  };
}
