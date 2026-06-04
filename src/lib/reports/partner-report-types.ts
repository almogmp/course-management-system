import type { PartnerReportMoney } from "@/lib/financial/partner-report-engine";

export type PartnerReportDateRange = {
  from: string;
  to: string;
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
  instructorRows: PartnerReportEntityRow[];
  institutionRows: PartnerReportEntityRow[];
};

export type PartnerReportFilterOptions = {
  instructors: Array<{ id: string; name: string }>;
  institutions: Array<{ id: string; name: string }>;
};
