import type { SessionStatus } from "@/components/sessions/constants";
import {
  computeSessionFinancials,
  courseRatesFromDb,
  sessionOverridesFromDb,
  type SessionFinancialBreakdown,
} from "@/lib/financial/session-financials";

export type FinancialSessionRecord = {
  id: string;
  session_date: string;
  status: SessionStatus;
  instructor_hours: number;
  company_hours: number;
  instructor_id: string;
  instructor_name: string;
  institution_id: string | null;
  institution_name: string | null;
  course_id: string;
  course_name: string;
  financials: SessionFinancialBreakdown;
};

export function buildFinancialSessionRecord(input: {
  id: string;
  session_date: string;
  status: SessionStatus;
  instructor_hours: number;
  company_hours: number;
  instructor_id: string;
  instructor_name: string;
  institution_id: string | null;
  institution_name: string | null;
  course_id: string;
  course_name: string;
  course: { company_hourly_rate: number; instructor_hourly_wage: number };
  session: { institution_hourly_rate: number | null; instructor_hourly_rate: number | null };
}): FinancialSessionRecord {
  const course = courseRatesFromDb(input.course);
  const overrides = sessionOverridesFromDb(input.session);

  return {
    id: input.id,
    session_date: input.session_date,
    status: input.status,
    instructor_hours: input.instructor_hours,
    company_hours: input.company_hours,
    instructor_id: input.instructor_id,
    instructor_name: input.instructor_name,
    institution_id: input.institution_id,
    institution_name: input.institution_name,
    course_id: input.course_id,
    course_name: input.course_name,
    financials: computeSessionFinancials({
      status: input.status,
      instructor_hours: input.instructor_hours,
      company_hours: input.company_hours,
      course,
      overrides,
    }),
  };
}

export function sumFinancialRecords(records: FinancialSessionRecord[]) {
  return records.reduce(
    (acc, record) => ({
      potentialGrossRevenue: acc.potentialGrossRevenue + record.financials.potentialGrossRevenue,
      actualGrossRevenue: acc.actualGrossRevenue + record.financials.actualGrossRevenue,
      potentialVatAmount: acc.potentialVatAmount + record.financials.potentialVatAmount,
      actualVatAmount: acc.actualVatAmount + record.financials.actualVatAmount,
      potentialNetRevenueBeforeInstructor:
        acc.potentialNetRevenueBeforeInstructor +
        record.financials.potentialNetRevenueBeforeInstructor,
      actualNetRevenueBeforeInstructor:
        acc.actualNetRevenueBeforeInstructor + record.financials.actualNetRevenueBeforeInstructor,
      potentialInstructorPayout:
        acc.potentialInstructorPayout + record.financials.potentialInstructorPayout,
      actualInstructorPayout:
        acc.actualInstructorPayout + record.financials.actualInstructorPayout,
      potentialGrossProfit: acc.potentialGrossProfit + record.financials.potentialGrossProfit,
      actualGrossProfit: acc.actualGrossProfit + record.financials.actualGrossProfit,
      potentialNetProfit: acc.potentialNetProfit + record.financials.potentialNetProfit,
      actualNetProfit: acc.actualNetProfit + record.financials.actualNetProfit,
      potentialRevenue: acc.potentialRevenue + record.financials.potentialRevenue,
      actualRevenue: acc.actualRevenue + record.financials.actualRevenue,
      potentialProfit: acc.potentialProfit + record.financials.potentialProfit,
      actualProfit: acc.actualProfit + record.financials.actualProfit,
    }),
    {
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
    },
  );
}
