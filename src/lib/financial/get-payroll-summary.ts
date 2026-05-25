import { getPayrollSessionsInRange } from "@/lib/payroll/get-payroll-sessions";

export type PayrollSummaryRow = {
  instructorId: string;
  instructorName: string;
  sessionCount: number;
  instructorHours: number;
  actualPayout: number;
  potentialPayout: number;
  cancelledCount: number;
  pendingApprovalCount: number;
};

export async function getPayrollSummary(input: {
  fromDate: string;
  toDate: string;
  instructorId?: string;
}): Promise<PayrollSummaryRow[]> {
  const sessionRows = await getPayrollSessionsInRange(input.fromDate, input.toDate);

  const filtered = input.instructorId
    ? sessionRows.filter((row) => row.instructorId === input.instructorId)
    : sessionRows;

  const byInstructor = new Map<string, PayrollSummaryRow>();

  for (const row of filtered) {
    const existing = byInstructor.get(row.instructorId) ?? {
      instructorId: row.instructorId,
      instructorName: row.instructorName,
      sessionCount: 0,
      instructorHours: 0,
      actualPayout: 0,
      potentialPayout: 0,
      cancelledCount: 0,
      pendingApprovalCount: 0,
    };

    existing.sessionCount += 1;
    existing.instructorHours += row.instructorHours;
    existing.actualPayout += row.actualPayout;
    existing.potentialPayout += row.potentialPayout;

    if (row.status === "cancelled") {
      existing.cancelledCount += 1;
    }

    if (row.status === "deferred") {
      existing.pendingApprovalCount += 1;
    }

    byInstructor.set(row.instructorId, existing);
  }

  return Array.from(byInstructor.values()).sort((a, b) =>
    a.instructorName.localeCompare(b.instructorName, "he"),
  );
}
