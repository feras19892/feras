import { fetchJson } from './http';
import type { DailyReport } from '../components/school/school-reports-types';

// ─── School Detailed Reports ───
export interface SchoolDetailedReport {
  date: string;
  total_reports: number;
  graded_reports: number;
  pending_reports: number;
  avg_grade: number;
  by_class: { class_name: string; report_count: number; avg_grade: number }[];
}

export async function getSchoolDetailedReports(date?: string) {
  const query = date ? `?date=${date}` : '';
  return fetchJson<{ success: boolean; report: DailyReport }>(`/api/school/reports/detailed${query}`);
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

export async function getTeacherEvaluation() {
  return fetchJson<{ success: boolean; evaluations: TeacherEvaluation[] }>('/api/school/reports/teacher-evaluation');
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
