/**
 * Manual validation scenarios for financial rate resolution.
 *
 * Run in a Node REPL or temporary script:
 *   import { runFinancialRateScenarios } from "@/lib/financial/financial-rate-scenarios";
 *   runFinancialRateScenarios();
 */

import {
  computeCompletedSessionMoney,
  resolveSessionRates,
} from "@/lib/financial/resolve-session-rates";

type ScenarioResult = {
  name: string;
  passed: boolean;
  detail: string;
};

function assert(name: string, condition: boolean, detail: string): ScenarioResult {
  return { name, passed: condition, detail };
}

/**
 * Scenario 1: Course + sessions together — rates stored on session row.
 * Expected: session-level rates used; revenue = company_hours × session rate.
 */
function scenarioCourseWithSessionsTogether(): ScenarioResult {
  const money = computeCompletedSessionMoney({
    company_hours: 2,
    instructor_hours: 2,
    sessionInstitutionHourlyRate: 300,
    sessionInstructorHourlyRate: 150,
    courseCompanyHourlyRate: 200,
    courseInstructorHourlyWage: 100,
  });

  return assert(
    "Scenario 1: course+sessions with session rates",
    money.grossRevenue === 600 &&
      money.instructorCost === 300 &&
      money.rates.companyRateSource === "session",
    `gross=${money.grossRevenue}, cost=${money.instructorCost}, source=${money.rates.companyRateSource}`,
  );
}

/**
 * Scenario 2: Course first, manual sessions — rates only on course (session NULL).
 * Expected: course fallback; revenue = company_hours × course rate.
 */
function scenarioCourseFallbackOnly(): ScenarioResult {
  const money = computeCompletedSessionMoney({
    company_hours: 3,
    instructor_hours: 3,
    sessionInstitutionHourlyRate: null,
    sessionInstructorHourlyRate: null,
    courseCompanyHourlyRate: 250,
    courseInstructorHourlyWage: 120,
  });

  return assert(
    "Scenario 2: course-only rates (null session overrides)",
    money.grossRevenue === 750 &&
      money.instructorCost === 360 &&
      money.rates.companyRateSource === "course",
    `gross=${money.grossRevenue}, cost=${money.instructorCost}, source=${money.rates.companyRateSource}`,
  );
}

/**
 * Scenario 3: Session manually edited with different rate.
 * Expected: session override wins over course.
 */
function scenarioSessionOverride(): ScenarioResult {
  const rates = resolveSessionRates({
    sessionInstitutionHourlyRate: 400,
    sessionInstructorHourlyRate: 180,
    courseCompanyHourlyRate: 250,
    courseInstructorHourlyWage: 120,
  });

  return assert(
    "Scenario 3: session override beats course",
    rates.companyRate === 400 &&
      rates.instructorRate === 180 &&
      rates.companyRateSource === "session",
    `company=${rates.companyRate}, instructor=${rates.instructorRate}`,
  );
}

/**
 * Scenario 4: Completed session with hours but no rate anywhere.
 * Expected: missing flags; revenue stays 0 (not silently "correct").
 */
function scenarioMissingRatesWarning(): ScenarioResult {
  const money = computeCompletedSessionMoney({
    company_hours: 2,
    instructor_hours: 2,
    sessionInstitutionHourlyRate: null,
    sessionInstructorHourlyRate: null,
    courseCompanyHourlyRate: 0,
    courseInstructorHourlyWage: 0,
  });

  return assert(
    "Scenario 4: missing rates flagged, revenue zero",
    money.grossRevenue === 0 &&
      money.rates.missingCompanyRate &&
      money.rates.missingInstructorRate,
    `gross=${money.grossRevenue}, missingCompany=${money.rates.missingCompanyRate}`,
  );
}

/**
 * Scenario 5: Multiple courses with different rates — each session calculated individually.
 * Expected: sum of per-session amounts, not averaged rate.
 */
function scenarioMultipleCoursesNoAveraging(): ScenarioResult {
  const a = computeCompletedSessionMoney({
    company_hours: 1,
    instructor_hours: 1,
    sessionInstitutionHourlyRate: null,
    sessionInstructorHourlyRate: null,
    courseCompanyHourlyRate: 100,
    courseInstructorHourlyWage: 50,
  });
  const b = computeCompletedSessionMoney({
    company_hours: 1,
    instructor_hours: 1,
    sessionInstitutionHourlyRate: null,
    sessionInstructorHourlyRate: null,
    courseCompanyHourlyRate: 300,
    courseInstructorHourlyWage: 150,
  });

  const totalGross = a.grossRevenue + b.grossRevenue;

  return assert(
    "Scenario 5: per-session sum (no averaging)",
    totalGross === 400 && a.grossRevenue === 100 && b.grossRevenue === 300,
    `totalGross=${totalGross}, a=${a.grossRevenue}, b=${b.grossRevenue}`,
  );
}

export function runFinancialRateScenarios(): ScenarioResult[] {
  return [
    scenarioCourseWithSessionsTogether(),
    scenarioCourseFallbackOnly(),
    scenarioSessionOverride(),
    scenarioMissingRatesWarning(),
    scenarioMultipleCoursesNoAveraging(),
  ];
}
