import { mapBulkDefaultStatusToDb } from "@/components/sessions/constants";
import { parseRequiredRate } from "@/lib/financial/parse-rates";
import type { BulkGenerationInput } from "@/lib/sessions/bulk-generate";
import { validateBulkGenerationInput } from "@/lib/sessions/bulk-generate";
import {
  parseWeekdaysFromForm,
  type ParsedBulkSessionForm,
} from "@/lib/sessions/parse-bulk-form";

export type ParsedCombinedCourseWithSessions = {
  course: {
    name: string;
    institutionId: string;
    primarySupplierId: string;
    leadInstructorId: string;
    institutionHourlyRate: number;
    instructorHourlyRate: number;
  };
  bulk: ParsedBulkSessionForm;
  generation: BulkGenerationInput;
};

export function parseCombinedCourseWithSessionsForm(
  formData: FormData,
): { ok: true; data: ParsedCombinedCourseWithSessions } | { ok: false; error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const institutionId = String(formData.get("institution_id") ?? "").trim();
  const primarySupplierId = String(formData.get("primary_supplier_id") ?? "").trim();
  const leadInstructorId = String(formData.get("lead_instructor_id") ?? "").trim();

  if (!name) {
    return { ok: false, error: "יש למלא שם קורס." };
  }

  if (!institutionId) {
    return { ok: false, error: "יש לבחור מוסד." };
  }

  if (!primarySupplierId) {
    return { ok: false, error: "יש לבחור ספק." };
  }

  if (!leadInstructorId) {
    return { ok: false, error: "יש לבחור מדריך." };
  }

  const institutionRate = parseRequiredRate(
    String(formData.get("institution_hourly_rate") ?? ""),
    "תעריף חברה",
  );

  if (!institutionRate.ok) {
    return { ok: false, error: institutionRate.error };
  }

  const instructorRate = parseRequiredRate(
    String(formData.get("instructor_hourly_rate") ?? ""),
    "תעריף מדריך",
  );

  if (!instructorRate.ok) {
    return { ok: false, error: instructorRate.error };
  }

  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const weekdays = parseWeekdaysFromForm(formData);
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const instructorHoursRaw = String(formData.get("instructor_hours") ?? "").trim();
  const companyHoursRaw = String(formData.get("company_hours") ?? "").trim();
  const formStatus = String(formData.get("default_status") ?? "scheduled").trim();

  const generation: BulkGenerationInput = {
    startDate,
    endDate,
    weekdays,
    startTime,
    endTime,
  };

  const validationError = validateBulkGenerationInput(generation);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  const instructorHours = Number(instructorHoursRaw);
  const companyHours = Number(companyHoursRaw);
  const status = mapBulkDefaultStatusToDb(formStatus);

  if (Number.isNaN(instructorHours) || instructorHours < 0) {
    return { ok: false, error: "שעות מדריך חייבות להיות מספר שאינו שלילי." };
  }

  if (Number.isNaN(companyHours) || companyHours < 0) {
    return { ok: false, error: "שעות חברה חייבות להיות מספר שאינו שלילי." };
  }

  if (!status) {
    return { ok: false, error: "סטטוס ברירת מחדל אינו תקין." };
  }

  return {
    ok: true,
    data: {
      course: {
        name,
        institutionId,
        primarySupplierId,
        leadInstructorId,
        institutionHourlyRate: institutionRate.value,
        instructorHourlyRate: instructorRate.value,
      },
      bulk: {
        startDate,
        endDate,
        weekdays,
        startTime,
        endTime,
        assignedInstructorId: leadInstructorId,
        instructorHours,
        companyHours,
        status,
        institutionHourlyRate: institutionRate.value,
        instructorHourlyRate: instructorRate.value,
      },
      generation,
    },
  };
}
