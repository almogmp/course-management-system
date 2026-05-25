/** Round to exactly 2 decimal places (money). */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
