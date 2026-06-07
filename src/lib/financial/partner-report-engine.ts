import {
  computeCompletedSessionMoney,
  type CompletedSessionFinancialInput,
  type CompletedSessionMoney,
} from "@/lib/financial/resolve-session-rates";
import { roundMoney } from "@/lib/financial/round-money";

/** Money totals for partner profit discussions (completed sessions only). */
export type PartnerReportMoney = CompletedSessionMoney;

export type PartnerReportSessionInput = CompletedSessionFinancialInput;

export function emptyPartnerReportMoney(): PartnerReportMoney {
  return {
    grossRevenue: 0,
    vat: 0,
    instructorCost: 0,
    grossProfit: 0,
  };
}

/**
 * Per completed session: company_hours × company rate, instructor_hours × instructor rate.
 * Rates resolved via shared resolver (session override → course fallback).
 */
export function computePartnerSessionMoney(input: PartnerReportSessionInput): PartnerReportMoney {
  const result = computeCompletedSessionMoney(input);
  return {
    grossRevenue: result.grossRevenue,
    vat: result.vat,
    instructorCost: result.instructorCost,
    grossProfit: result.grossProfit,
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
