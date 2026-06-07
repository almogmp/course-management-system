import type { PartnerReportRateAudit } from "@/lib/reports/partner-report-types";

type ReportsRateWarningsProps = {
  audit: PartnerReportRateAudit;
};

export function ReportsRateWarnings({ audit }: ReportsRateWarningsProps) {
  const hasMissingCompany = audit.missingCompanyRateSessionCount > 0;
  const hasMissingInstructor = audit.missingInstructorRateSessionCount > 0;

  if (!hasMissingCompany && !hasMissingInstructor) {
    return null;
  }

  return (
    <section
      aria-label="אזהרות תמחור"
      className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-start text-sm text-amber-950"
    >
      {hasMissingCompany ? (
        <p>
          <span className="font-semibold">חסרים תעריפי חברה בחלק מהמפגשים</span>
          {" — "}
          {audit.missingCompanyRateSessionCount} מפגשים שבוצעו עם שעות חברה אך ללא תעריף חברה
          (לא במפגש ולא בקורס).
        </p>
      ) : null}

      {hasMissingInstructor ? (
        <p>
          <span className="font-semibold">חסרים תעריפי מדריך בחלק מהמפגשים</span>
          {" — "}
          {audit.missingInstructorRateSessionCount} מפגשים שבוצעו עם שעות מדריך אך ללא תעריף
          מדריך (לא במפגש ולא בקורס).
        </p>
      ) : null}

      <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-amber-800">תעריף חברה ברמת מפגש</dt>
          <dd className="font-medium">{audit.sessionLevelCompanyRateCount} מפגשים</dd>
        </div>
        <div>
          <dt className="text-amber-800">תעריף חברה מקורס (גיבוי)</dt>
          <dd className="font-medium">{audit.courseFallbackCompanyRateCount} מפגשים</dd>
        </div>
        <div>
          <dt className="text-amber-800">תעריף מדריך ברמת מפגש</dt>
          <dd className="font-medium">{audit.sessionLevelInstructorRateCount} מפגשים</dd>
        </div>
        <div>
          <dt className="text-amber-800">תעריף מדריך מקורס (גיבוי)</dt>
          <dd className="font-medium">{audit.courseFallbackInstructorRateCount} מפגשים</dd>
        </div>
      </dl>
    </section>
  );
}
