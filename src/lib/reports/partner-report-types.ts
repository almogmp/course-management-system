import type { PartnerReportMoney } from "@/lib/financial/partner-report-engine";

export type PartnerReportDateRange = {
  from: string;
  to: string;
};

export type PartnerReportRateAudit = {
  missingCompanyRateSessionCount: number;
  missingInstructorRateSessionCount: number;
  sessionLevelCompanyRateCount: number;
  courseFallbackCompanyRateCount: number;
  sessionLevelInstructorRateCount: number;
  courseFallbackInstructorRateCount: number;
};

export type PartnerReportEntityRow = {
  id: string;
  name: string;
  completedSessionCount: number;
  totalHours: number;
} & PartnerReportMoney;

export type PartnerFinancialReport = {
  dateRange: PartnerReportDateRange;
  totals: {
    completedSessionCount: number;
    totalHours: number;
  } & PartnerReportMoney;
  rateAudit: PartnerReportRateAudit;
  instructorRows: PartnerReportEntityRow[];
  institutionRows: PartnerReportEntityRow[];
};

export type PartnerReportFilterOptions = {
  instructors: Array<{ id: string; name: string }>;
  institutions: Array<{ id: string; name: string }>;
};
