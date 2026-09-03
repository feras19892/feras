import { fetchJson } from './http';

export interface SchoolReportSummary {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  reports_today: number;
  pending_reports: number;
  overdue_reports: number;
}

export interface SchoolReportClassItem {
  class_id: string;
  class_name: string;
  class_code: string;
  teacher_name: string;
  is_frozen: boolean;
  is_active: boolean;
  student_count: number;
  active_today: number;
  reports_today: number;
  graded_today: number;
  pending_reports: number;
  overdue_reports: number;
  quiz_submissions_today: number;
  class_average: number;
  issues: string[];
}

// ─── School Detailed Reports ───
export interface SchoolDetailedReport {
  date: string;
  summary: SchoolReportSummary;
  classes: SchoolReportClassItem[];
}

export async function getSchoolDetailedReports(date?: string) {
  const query = date ? `?date=${date}` : '';
  return fetchJson<{ success: boolean; report: SchoolDetailedReport }>(`/api/school/reports/detailed${query}`);
}

export interface OutstandingStudent {
  id: number;
  name: string;
  email: string;
  report_count: number;
  avg_grade: number;
  excellent_count: number;
  graded_count: number;
  badge_count: number;
}

export async function getOutstandingStudents(limit?: number) {
  const query = limit ? `?limit=${limit}` : '';
  return fetchJson<{ success: boolean; students: OutstandingStudent[] }>(`/api/school/reports/outstanding-students${query}`);
}

export interface StrugglingStudent {
  id: number;
  name: string;
  email: string;
  report_count: number;
  avg_grade: number;
  pending_count: number;
  failing_count: number;
  last_activity: string | null;
  needs_encouragement: boolean;
  days_inactive: number | null;
}

export async function getStrugglingStudents(limit?: number) {
  const query = limit ? `?limit=${limit}` : '';
  return fetchJson<{ success: boolean; students: StrugglingStudent[] }>(`/api/school/reports/struggling-students${query}`);
}

export interface TeacherEvaluation {
  id: number;
  name: string;
  email: string;
  class_count: number;
  total_students: number;
  total_reports: number;
  graded_reports: number;
  pending_reports: number;
  grading_rate: number;
  avg_grade: number;
  quiz_count: number;
  quiz_submissions: number;
  avg_grading_hours: number | null;
  last_graded_at: string | null;
  last_report_at: string | null;
  teaching_score: number;
  is_blocked: boolean;
}

export interface StudentEvaluation {
  id: number;
  name: string;
  email: string;
  created_at: string;
  blocked_at?: string | null;
  class_count: number;
  total_reports: number;
  graded_reports: number;
  pending_reports: number;
  grading_rate: number;
  avg_grade: number;
  quiz_submissions: number;
  badge_count: number;
  last_report_at: string | null;
  last_graded_at: string | null;
  student_score: number;
  is_blocked: boolean;
}

export async function getTeacherEvaluation() {
  return fetchJson<{ success: boolean; evaluations: TeacherEvaluation[] }>('/api/school/reports/teacher-evaluation');
}

export async function getStudentEvaluation() {
  return fetchJson<{ success: boolean; evaluations: StudentEvaluation[] }>('/api/school/reports/student-evaluation');
}

// ─── School Feedback ───
export interface SchoolFeedbackItem {
  id: number;
  type: string;
  user_name: string;
  experiment_name?: string;
  rating?: number | null;
  message: string;
  status: string;
  created_at: string;
}

export interface SchoolFeedbackStats {
  total: number;
  open: number;
  resolved: number;
  dismissed: number;
  avg_rating: number;
}

export async function getSchoolFeedback() {
  return fetchJson<{ success: boolean; feedback: SchoolFeedbackItem[]; stats: SchoolFeedbackStats }>('/api/school/feedback');
}

export async function updateSchoolFeedbackStatus(id: number, status: string) {
  return fetchJson<{ success: boolean }>(`/api/school/feedback/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}
