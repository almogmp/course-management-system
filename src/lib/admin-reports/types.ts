import type { SessionStatus } from "@/components/sessions/constants";

export type AdminReportStatusFilter =
  | "all"
  | "completed"
  | "planned"
  | "active"
  | "cancelled"
  | "deferred";

export type AdminReportFilters = {
  fromDate: string;
  toDate: string;
  supplierId?: string;
  institutionId?: string;
  instructorId?: string;
  status: AdminReportStatusFilter;
};

export type AdminReportSessionFinancials = {
  grossRevenue: number;
  vatAmount: number;
  netRevenueBeforeInstructor: number;
  instructorPayout: number;
  grossProfit: number;
  netProfit: number;
};

export type AdminReportSessionRow = {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  supplierId: string | null;
  supplierName: string;
  institutionId: string | null;
  institutionName: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  instructorHours: number;
  companyHours: number;
  institutionHourlyRate: number;
  instructorHourlyRate: number;
  financials: AdminReportSessionFinancials;
  notes: string;
};

export type AdminReportSummary = {
  totalSessions: number;
  instructorHours: number;
  companyHours: number;
  totalGrossRevenue: number;
  totalVat: number;
  totalNetRevenue: number;
  totalInstructorPayout: number;
  totalGrossProfit: number;
  totalNetProfit: number;
  cancelledCount: number;
  deferredCount: number;
};

export type AdminReportData = {
  filters: AdminReportFilters;
  summary: AdminReportSummary;
  rows: AdminReportSessionRow[];
  filterLabels: {
    supplierName: string;
    institutionName: string;
    instructorName: string;
    statusLabel: string;
    dateRangeLabel: string;
  };
};

export type AdminReportFilterOptions = {
  suppliers: Array<{ id: string; name: string }>;
  institutions: Array<{ id: string; name: string }>;
  instructors: Array<{ id: string; full_name: string }>;
};
