import type { SessionStatus } from "@/components/sessions/constants";
import { roundMoney } from "@/lib/financial/round-money";
import {
  courseRatesFromDb as resolveCourseRatesFromDb,
  resolveSessionRates,
  sessionRatesFromDb,
} from "@/lib/financial/resolve-session-rates";
import {
  countsAsActualFinancial,
  countsAsPotentialFinancial,
} from "@/lib/financial/status";
import { computeVatFinancialAmounts } from "@/lib/financial/vat";

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
  /** Gross institution charge (incl. VAT) — potential status bucket */
  potentialGrossRevenue: number;
  /** Gross institution charge (incl. VAT) — actual/completed bucket */
  actualGrossRevenue: number;
  potentialVatAmount: number;
  actualVatAmount: number;
  potentialNetRevenueBeforeInstructor: number;
  actualNetRevenueBeforeInstructor: number;
  potentialInstructorPayout: number;
  actualInstructorPayout: number;
  potentialGrossProfit: number;
  actualGrossProfit: number;
  potentialNetProfit: number;
  actualNetProfit: number;
  /** @deprecated Use actualGrossRevenue */
  potentialRevenue: number;
  /** @deprecated Use actualGrossRevenue */
  actualRevenue: number;
  /** @deprecated Use actualGrossProfit */
  potentialProfit: number;
  /** @deprecated Use actualGrossProfit */
  actualProfit: number;
};

function grossRevenueForSession(
  companyHours: number,
  institutionHourlyRate: number,
): number {
  return roundMoney(companyHours * institutionHourlyRate);
}

function instructorPayoutForSession(
  instructorHours: number,
  instructorHourlyRate: number,
): number {
  return roundMoney(instructorHours * instructorHourlyRate);
}

function emptyFinancialBuckets(): Pick<
  SessionFinancialBreakdown,
  | "potentialGrossRevenue"
  | "actualGrossRevenue"
  | "potentialVatAmount"
  | "actualVatAmount"
  | "potentialNetRevenueBeforeInstructor"
  | "actualNetRevenueBeforeInstructor"
  | "potentialInstructorPayout"
  | "actualInstructorPayout"
  | "potentialGrossProfit"
  | "actualGrossProfit"
  | "potentialNetProfit"
  | "actualNetProfit"
  | "potentialRevenue"
  | "actualRevenue"
  | "potentialProfit"
  | "actualProfit"
> {
  return {
    potentialGrossRevenue: 0,
    actualGrossRevenue: 0,
    potentialVatAmount: 0,
    actualVatAmount: 0,
    potentialNetRevenueBeforeInstructor: 0,
    actualNetRevenueBeforeInstructor: 0,
    potentialInstructorPayout: 0,
    actualInstructorPayout: 0,
    potentialGrossProfit: 0,
    actualGrossProfit: 0,
    potentialNetProfit: 0,
    actualNetProfit: 0,
    potentialRevenue: 0,
    actualRevenue: 0,
    potentialProfit: 0,
    actualProfit: 0,
  };
}

function applyVatBucket(
  buckets: ReturnType<typeof emptyFinancialBuckets>,
  kind: "potential" | "actual",
  gross: number,
  payout: number,
): void {
  const amounts = computeVatFinancialAmounts(gross, payout);

  if (kind === "potential") {
    buckets.potentialGrossRevenue = amounts.grossRevenue;
    buckets.potentialVatAmount = amounts.vatAmount;
    buckets.potentialNetRevenueBeforeInstructor = amounts.netRevenueBeforeInstructor;
    buckets.potentialInstructorPayout = amounts.instructorPayout;
    buckets.potentialGrossProfit = amounts.grossProfit;
    buckets.potentialNetProfit = amounts.netProfit;
    buckets.potentialRevenue = amounts.grossRevenue;
    buckets.potentialProfit = amounts.grossProfit;
    return;
  }

  buckets.actualGrossRevenue = amounts.grossRevenue;
  buckets.actualVatAmount = amounts.vatAmount;
  buckets.actualNetRevenueBeforeInstructor = amounts.netRevenueBeforeInstructor;
  buckets.actualInstructorPayout = amounts.instructorPayout;
  buckets.actualGrossProfit = amounts.grossProfit;
  buckets.actualNetProfit = amounts.netProfit;
  buckets.actualRevenue = amounts.grossRevenue;
  buckets.actualProfit = amounts.grossProfit;
}

export function getEffectiveRatesFromParts(
  course: CourseRateDefaults,
  overrides: SessionRateOverrides,
): {
  effectiveInstitutionHourlyRate: number;
  effectiveInstructorHourlyRate: number;
  missingInstitutionRate: boolean;
  missingInstructorRate: boolean;
} {
  const resolved = resolveSessionRates({
    sessionInstitutionHourlyRate: overrides.institutionHourlyRate,
    sessionInstructorHourlyRate: overrides.instructorHourlyRate,
    courseCompanyHourlyRate: course.institutionHourlyRate,
    courseInstructorHourlyWage: course.instructorHourlyRate,
  });

  return {
    effectiveInstitutionHourlyRate: resolved.companyRate,
    effectiveInstructorHourlyRate: resolved.instructorRate,
    missingInstitutionRate: resolved.missingCompanyRate,
    missingInstructorRate: resolved.missingInstructorRate,
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

  const buckets = emptyFinancialBuckets();

  if (countsAsPotentialFinancial(session.status)) {
    const gross = grossRevenueForSession(session.company_hours, effectiveInstitutionHourlyRate);
    const payout = instructorPayoutForSession(
      session.instructor_hours,
      effectiveInstructorHourlyRate,
    );
    applyVatBucket(buckets, "potential", gross, payout);
  }

  if (countsAsActualFinancial(session.status)) {
    const gross = grossRevenueForSession(session.company_hours, effectiveInstitutionHourlyRate);
    const payout = instructorPayoutForSession(
      session.instructor_hours,
      effectiveInstructorHourlyRate,
    );
    applyVatBucket(buckets, "actual", gross, payout);
  }

  return {
    effectiveInstitutionHourlyRate,
    effectiveInstructorHourlyRate,
    missingInstitutionRate,
    missingInstructorRate,
    ...buckets,
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
      potentialGrossRevenue: acc.potentialGrossRevenue + row.potentialGrossRevenue,
      actualGrossRevenue: acc.actualGrossRevenue + row.actualGrossRevenue,
      potentialVatAmount: acc.potentialVatAmount + row.potentialVatAmount,
      actualVatAmount: acc.actualVatAmount + row.actualVatAmount,
      potentialNetRevenueBeforeInstructor:
        acc.potentialNetRevenueBeforeInstructor + row.potentialNetRevenueBeforeInstructor,
      actualNetRevenueBeforeInstructor:
        acc.actualNetRevenueBeforeInstructor + row.actualNetRevenueBeforeInstructor,
      potentialInstructorPayout: acc.potentialInstructorPayout + row.potentialInstructorPayout,
      actualInstructorPayout: acc.actualInstructorPayout + row.actualInstructorPayout,
      potentialGrossProfit: acc.potentialGrossProfit + row.potentialGrossProfit,
      actualGrossProfit: acc.actualGrossProfit + row.actualGrossProfit,
      potentialNetProfit: acc.potentialNetProfit + row.potentialNetProfit,
      actualNetProfit: acc.actualNetProfit + row.actualNetProfit,
      potentialRevenue: acc.potentialRevenue + row.potentialRevenue,
      actualRevenue: acc.actualRevenue + row.actualRevenue,
      potentialProfit: acc.potentialProfit + row.potentialProfit,
      actualProfit: acc.actualProfit + row.actualProfit,
    }),
    emptyFinancialBuckets(),
  );
}

/** Map DB course columns to financial course defaults. */
export function courseRatesFromDb(course: {
  company_hourly_rate: number;
  instructor_hourly_wage: number;
}): CourseRateDefaults {
  const mapped = resolveCourseRatesFromDb(course);

  return {
    institutionHourlyRate: mapped.courseCompanyHourlyRate ?? 0,
    instructorHourlyRate: mapped.courseInstructorHourlyWage ?? 0,
  };
}

export function sessionOverridesFromDb(session: {
  institution_hourly_rate: number | null;
  instructor_hourly_rate: number | null;
}): SessionRateOverrides {
  const mapped = sessionRatesFromDb(session);

  return {
    institutionHourlyRate: mapped.sessionInstitutionHourlyRate,
    instructorHourlyRate: mapped.sessionInstructorHourlyRate,
  };
}
