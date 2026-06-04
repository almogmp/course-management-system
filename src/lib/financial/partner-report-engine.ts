import { roundMoney } from "@/lib/financial/round-money";
import { VAT_DIVISOR } from "@/lib/financial/vat";

/** Money totals for partner profit discussions (completed sessions only). */
export type PartnerReportMoney = {
  grossRevenue: number;
  vat: number;
  instructorCost: number;
  grossProfit: number;
};

export type PartnerReportSessionInput = {
  instructor_hours: number;
  /** Stored on session as institution_hourly_rate (company billing rate). */
  company_hourly_rate: number | null;
  instructor_hourly_rate: number | null;
};

export function emptyPartnerReportMoney(): PartnerReportMoney {
  return {
    grossRevenue: 0,
    vat: 0,
    instructorCost: 0,
    grossProfit: 0,
  };
}

/**
 * Per-session financials using only values stored on the session row.
 * Hours: instructor_hours. Rates: session company + instructor hourly rates.
 */
export function computePartnerSessionMoney(
  input: PartnerReportSessionInput,
): PartnerReportMoney {
  const hours = input.instructor_hours;
  const companyRate = input.company_hourly_rate ?? 0;
  const instructorRate = input.instructor_hourly_rate ?? 0;

  const grossRevenue = roundMoney(hours * companyRate);
  const instructorCost = roundMoney(hours * instructorRate);
  const vat = roundMoney(grossRevenue - grossRevenue / VAT_DIVISOR);
  const grossProfit = roundMoney(grossRevenue - vat - instructorCost);

  return {
    grossRevenue,
    vat,
    instructorCost,
    grossProfit,
  };
}

export function sumPartnerReportMoney(rows: PartnerReportMoney[]): PartnerReportMoney {
  return rows.reduce(
    (acc, row) => ({
      grossRevenue: roundMoney(acc.grossRevenue + row.grossRevenue),
      vat: roundMoney(acc.vat + row.vat),
      instructorCost: roundMoney(acc.instructorCost + row.instructorCost),
      grossProfit: roundMoney(acc.grossProfit + row.grossProfit),
    }),
    emptyPartnerReportMoney(),
  );
}
