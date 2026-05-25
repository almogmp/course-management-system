/**
 * Future-ready placeholder for instructor monthly report approval.
 *
 * Recommended later (not in MVP):
 * - `instructor_monthly_reports` table: instructor_id, year, month, status, approved_at
 * - RLS: instructors submit/view own; admins approve
 * - Link payroll export to approved reports only
 *
 * No schema in MVP — calculations remain admin-driven from session data.
 */

export type InstructorMonthlyReportApprovalStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected";
