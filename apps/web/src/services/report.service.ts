import { fetchJson } from './http';

export interface Report {
  id: number;
  student_id: number;
  class_id: string;
  experiment_type: string;
  experiment_name: string;
  experiment_id?: string;
  readings: string;
  params?: string;
  student_info?: string;
  conclusion?: string;
  conclusion_errors?: string;
  conclusion_improvements?: string;
  columns?: string;
  equations?: string;
  plots?: string;
  chart_snapshot?: string;
  status: 'draft' | 'submitted' | 'graded' | 'resubmitted';
  version: number;
  teacher_seen: boolean;
  feedback_seen?: boolean;
  grade?: number;
  feedback?: string;
  graded_by?: number;
  graded_by_name?: string;
  grade_accuracy?: number;
  grade_presentation?: number;
  grade_conclusion?: number;
  grade_innovation?: number;
  submitted_at?: string;
  graded_at?: string;
  student_name?: string;
  student_avatar_url?: string | null;
  created_at?: string;
}

export interface ReportComment {
  id: number;
  report_id: number;
  author_id: number;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

export interface GradeHistoryEntry {
  id: number;
  report_id: number;
  teacher_id: number;
  teacher_name: string;
  old_grade?: number;
  new_grade: number;
  old_feedback?: string;
  new_feedback?: string;
  created_at: string;
}

export async function createReport(data: {
  class_id: string;
  experiment_type: string;
  experiment_name: string;
  experiment_id?: string;
  readings: string;
  params?: string;
  student_info?: string;
  conclusion?: string;
  conclusion_errors?: string;
  conclusion_improvements?: string;
  columns?: string;
  equations?: string;
  plots?: string;
  chart_snapshot?: string;
}) {
  return fetchJson<{ success: boolean; report: Report }>('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function resubmitReport(reportId: number, data: {
  class_id: string;
  experiment_type: string;
  experiment_name: string;
  experiment_id?: string;
  readings: string;
  params?: string;
  student_info?: string;
  conclusion?: string;
  conclusion_errors?: string;
  conclusion_improvements?: string;
  columns?: string;
  equations?: string;
  plots?: string;
  chart_snapshot?: string;
}) {
  return fetchJson<{ success: boolean; report: Report }>(`/api/reports/${reportId}/resubmit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getReports(params?: { class_id?: string; student_id?: string; status?: string; search?: string; page?: number; limit?: number }) {
  const qs = params ? '?' + new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString() : '';
  return fetchJson<{ success: boolean; reports: Report[]; total: number; page: number; limit: number; totalPages: number }>(`/api/reports${qs}`);
}

export async function getReport(id: number) {
  return fetchJson<{ success: boolean; report: Report }>(`/api/reports/${id}`);
}

export async function markReportSeen(id: number) {
  return fetchJson<{ success: boolean }>(`/api/reports/${id}/seen`, { method: 'PATCH' });
}

export async function gradeReport(id: number, data: { grade: number; feedback?: string; grade_accuracy?: number; grade_presentation?: number; grade_conclusion?: number; grade_innovation?: number }) {
  return fetchJson<{ success: boolean }>(`/api/reports/${id}/grade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function addComment(reportId: number, content: string) {
  return fetchJson<{ success: boolean; comment: ReportComment }>(`/api/reports/${reportId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export async function getComments(reportId: number) {
  return fetchJson<{ success: boolean; comments: ReportComment[] }>(`/api/reports/${reportId}/comments`);
}

export async function getGradeHistory(reportId: number) {
  return fetchJson<{ success: boolean; history: GradeHistoryEntry[] }>(`/api/reports/${reportId}/history`);
}

export async function getStudentStats(studentId: number) {
  return fetchJson<{ success: boolean; stats: {
    total: number;
    graded: number;
    pending: number;
    average: number;
  } }>(`/api/reports/student/${studentId}/stats`);
}

export async function getClassStats(classId: string) {
  return fetchJson<{ success: boolean; stats: {
    total: number;
    graded: number;
    pending: number;
    average: number;
    experiments: { name: string; count: number; avg: number; highest: number; lowest: number }[];
    students: { id: number; name: string; reports: number; avg: number; lastSubmitted?: string }[];
    distribution: Record<string, number>;
  } }>(`/api/reports/class/${classId}/stats`);
}

export async function exportClassReports(classId: string) {
  return fetchJson<{ success: boolean; reports: Report[] }>(`/api/reports/class/${classId}/export`);
}

export async function deleteReport(id: number) {
  return fetchJson<{ success: boolean }>(`/api/reports/${id}`, { method: 'DELETE' });
}

export async function markFeedbackSeen(id: number) {
  return fetchJson<{ success: boolean }>(`/api/reports/${id}/feedback-seen`, { method: 'PATCH' });
}

export async function downloadGradebook(classId: string) {
  const res = await fetch(`/api/reports/class/${classId}/gradebook.csv`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to download gradebook');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gradebook_${classId}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
