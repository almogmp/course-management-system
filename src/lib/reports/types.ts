import type { CourseStatus } from "@/components/courses/constants";
import type { SessionStatus } from "@/components/sessions/constants";
import type { InstructorWorkloadRow } from "@/lib/dashboard/workload";

export type ReportSessionRecord = {
  id: string;
  status: SessionStatus;
  instructor_hours: number;
  company_hours: number;
  instructor_id: string;
  instructor_name: string;
  institution_id: string | null;
  institution_name: string | null;
  course_id: string;
  course_name: string;
  course_status: CourseStatus;
};

export type ReportSummary = {
  totalSessions: number;
  completedCount: number;
  cancelledCount: number;
  instructorHours: number;
  companyHours: number;
};

export type InstitutionReportRow = {
  institutionId: string;
  institutionName: string;
  sessionCount: number;
  completedCount: number;
  cancelledCount: number;
  instructorHours: number;
  companyHours: number;
};

export type CourseReportRow = {
  courseId: string;
  courseName: string;
  institutionName: string | null;
  instructorName: string;
  sessionCount: number;
  instructorHours: number;
  companyHours: number;
  courseStatus: CourseStatus;
};

export type MonthlyReportData = {
  summary: ReportSummary;
  instructorRows: InstructorWorkloadRow[];
  institutionRows: InstitutionReportRow[];
  courseRows: CourseReportRow[];
};

export type ReportFilterOptions = {
  instructors: Array<{ id: string; name: string }>;
  institutions: Array<{ id: string; name: string }>;
};
