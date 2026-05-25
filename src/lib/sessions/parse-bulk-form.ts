import { mapBulkDefaultStatusToDb } from "@/components/sessions/constants";
import type { BulkGenerationInput } from "@/lib/sessions/bulk-generate";
import { validateBulkGenerationInput } from "@/lib/sessions/bulk-generate";
import { parseOptionalRate } from "@/lib/financial/parse-rates";

export type ParsedBulkSessionForm = {
  startDate: string;
  endDate: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  assignedInstructorId: string;
  instructorHours: number;
  companyHours: number;
  status: NonNullable<ReturnType<typeof mapBulkDefaultStatusToDb>>;
  institutionHourlyRate: number | null;
  instructorHourlyRate: number | null;
};

export function parseWeekdaysFromForm(formData: FormData): number[] {
  const raw = formData.getAll("weekdays");

  return raw
    .map((value) => Number(String(value)))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
}

export function parseBulkSessionForm(
  formData: FormData,
): { ok: true; data: ParsedBulkSessionForm; generation: BulkGenerationInput } | { ok: false; error: string } {
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const weekdays = parseWeekdaysFromForm(formData);
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();
  const assignedInstructorId = String(formData.get("assigned_instructor_id") ?? "").trim();
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

  if (!assignedInstructorId) {
    return { ok: false, error: "יש לבחור מדריך." };
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

  const institutionRate = parseOptionalRate(
    String(formData.get("institution_hourly_rate") ?? ""),
    "מחיר לשעה מהמוסד",
  );

  if (!institutionRate.ok) {
    return { ok: false, error: institutionRate.error };
  }

  const instructorRate = parseOptionalRate(
    String(formData.get("instructor_hourly_rate") ?? ""),
    "שכר מדריך לשעה",
  );

  if (!instructorRate.ok) {
    return { ok: false, error: instructorRate.error };
  }

  return {
    ok: true,
    data: {
      startDate,
      endDate,
      weekdays,
      startTime,
      endTime,
      assignedInstructorId,
      instructorHours,
      companyHours,
      status,
      institutionHourlyRate: institutionRate.value,
      instructorHourlyRate: instructorRate.value,
    },
    generation,
  };
}
