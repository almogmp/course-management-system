import type { SessionStatus } from "@/components/sessions/constants";
import {
  buildFinancialSessionRecord,
  type FinancialSessionRecord,
} from "@/lib/financial/financial-session-record";
import {
  countsAsActualFinancial,
  countsAsCancelledFinancial,
  countsAsPotentialFinancial,
} from "@/lib/financial/status";
import { getEffectiveInstructorId } from "@/lib/sessions/instructor-assignment";
import { resolveSessionInstructorDisplayName } from "@/lib/sessions/resolve-instructor-display-name";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { AdminReportSessionRow } from "@/lib/admin-reports/types";

type ReportSessionQueryRow = Pick<
  Database["public"]["Tables"]["sessions"]["Row"],
  | "id"
  | "session_date"
  | "start_time"
  | "end_time"
  | "status"
  | "instructor_hours"
  | "company_hours"
  | "substitute_instructor_id"
  | "institution_hourly_rate"
  | "instructor_hourly_rate"
  | "admin_note"
  | "cancellation_reason"
> & {
  substitute_instructor: Pick<Database["public"]["Tables"]["instructors"]["Row"], "full_name"> | null;
  courses: Pick<
    Database["public"]["Tables"]["courses"]["Row"],
    | "id"
    | "name"
    | "institution_id"
    | "lead_instructor_id"
    | "primary_supplier_id"
    | "company_hourly_rate"
    | "instructor_hourly_wage"
  > & {
    institutions: Pick<Database["public"]["Tables"]["institutions"]["Row"], "id" | "name"> | null;
    lead_instructor: Pick<Database["public"]["Tables"]["instructors"]["Row"], "full_name"> | null;
    primary_suppliers: Pick<Database["public"]["Tables"]["primary_suppliers"]["Row"], "id" | "name"> | null;
  } | null;
};

function displayFinancialAmounts(
  status: SessionStatus,
  financials: FinancialSessionRecord["financials"],
): { revenue: number; instructorPayout: number; profit: number } {
  if (countsAsCancelledFinancial(status)) {
    return { revenue: 0, instructorPayout: 0, profit: 0 };
  }

  if (countsAsActualFinancial(status)) {
    return {
      revenue: financials.actualRevenue,
      instructorPayout: financials.actualInstructorPayout,
      profit: financials.actualProfit,
    };
  }

  if (countsAsPotentialFinancial(status)) {
    return {
      revenue: financials.potentialRevenue,
      instructorPayout: financials.potentialInstructorPayout,
      profit: financials.potentialProfit,
    };
  }

  return { revenue: 0, instructorPayout: 0, profit: 0 };
}

function buildNotes(adminNote: string | null, cancellationReason: string | null): string {
  return [adminNote, cancellationReason].filter(Boolean).join(" · ");
}

export async function getAdminReportSessionRows(
  fromDate: string,
  toDate: string,
): Promise<AdminReportSessionRow[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: sessionRows, error: sessionsError }, { data: instructorRows, error: instructorsError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          `id, session_date, start_time, end_time, status, instructor_hours, company_hours,
           substitute_instructor_id, institution_hourly_rate, instructor_hourly_rate,
           admin_note, cancellation_reason,
           substitute_instructor:instructors!sessions_substitute_instructor_id_fkey(full_name),
           courses(
             id, name, institution_id, lead_instructor_id, primary_supplier_id,
             company_hourly_rate, instructor_hourly_wage,
             institutions(id, name),
             lead_instructor:instructors!courses_lead_instructor_id_fkey(full_name),
             primary_suppliers(id, name)
           )`,
        )
        .gte("session_date", fromDate)
        .lte("session_date", toDate)
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true }),
      supabase.from("instructors").select("id, full_name"),
    ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (instructorsError) {
    throw new Error(instructorsError.message);
  }

  const instructorNames = new Map(
    (instructorRows ?? []).map((row) => [row.id, row.full_name]),
  );

  const rows: AdminReportSessionRow[] = [];

  for (const row of (sessionRows ?? []) as ReportSessionQueryRow[]) {
    const course = row.courses;
    if (!course?.lead_instructor_id) {
      continue;
    }

    const instructorId = getEffectiveInstructorId(
      row.substitute_instructor_id,
      course.lead_instructor_id,
    );

    const instructorName = resolveSessionInstructorDisplayName({
      substituteInstructorId: row.substitute_instructor_id,
      substituteName: row.substitute_instructor?.full_name,
      leadInstructorId: course.lead_instructor_id,
      leadName: course.lead_instructor?.full_name,
      nameById: instructorNames,
    });

    const financialRecord = buildFinancialSessionRecord({
      id: row.id,
      session_date: row.session_date,
      status: row.status as SessionStatus,
      instructor_hours: row.instructor_hours,
      company_hours: row.company_hours,
      instructor_id: instructorId,
      instructor_name: instructorName,
      institution_id: course.institution_id,
      institution_name: course.institutions?.name ?? null,
      course_id: course.id,
      course_name: course.name,
      course: {
        company_hourly_rate: course.company_hourly_rate,
        instructor_hourly_wage: course.instructor_hourly_wage,
      },
      session: {
        institution_hourly_rate: row.institution_hourly_rate,
        instructor_hourly_rate: row.instructor_hourly_rate,
      },
    });

    const amounts = displayFinancialAmounts(row.status as SessionStatus, financialRecord.financials);

    rows.push({
      id: row.id,
      sessionDate: row.session_date,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status as SessionStatus,
      supplierId: course.primary_suppliers?.id ?? course.primary_supplier_id ?? null,
      supplierName: course.primary_suppliers?.name ?? "—",
      institutionId: course.institution_id,
      institutionName: course.institutions?.name ?? "—",
      courseId: course.id,
      courseName: course.name,
      instructorId,
      instructorName,
      instructorHours: row.instructor_hours,
      companyHours: row.company_hours,
      institutionHourlyRate: financialRecord.financials.effectiveInstitutionHourlyRate,
      instructorHourlyRate: financialRecord.financials.effectiveInstructorHourlyRate,
      revenue: amounts.revenue,
      instructorPayout: amounts.instructorPayout,
      profit: amounts.profit,
      notes: buildNotes(row.admin_note, row.cancellation_reason) || "—",
    });
  }

  return rows;
}
