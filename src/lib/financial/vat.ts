import { roundMoney } from "@/lib/financial/round-money";

/** Institution rates are gross including 18% VAT. */
export const VAT_DIVISOR = 1.18;

export type VatFinancialAmounts = {
  grossRevenue: number;
  vatAmount: number;
  netRevenueBeforeInstructor: number;
  instructorPayout: number;
  grossProfit: number;
  netProfit: number;
};

export function computeVatFinancialAmounts(
  grossRevenue: number,
  instructorPayout: number,
): VatFinancialAmounts {
  const gross = roundMoney(grossRevenue);
  const payout = roundMoney(instructorPayout);
  const netRevenueBeforeInstructor = roundMoney(gross / VAT_DIVISOR);
  const vatAmount = roundMoney(gross - netRevenueBeforeInstructor);
  const grossProfit = roundMoney(gross - payout);
  const netProfit = roundMoney(netRevenueBeforeInstructor - payout);

  return {
    grossRevenue: gross,
    vatAmount,
    netRevenueBeforeInstructor,
    instructorPayout: payout,
    grossProfit,
    netProfit,
  };
}
