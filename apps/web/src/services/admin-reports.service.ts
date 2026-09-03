import { fetchJson } from './http';
import type { AdminReportItem } from './admin.types';

export interface AdminReportsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  schoolId?: string;
  classId?: string;
  teacherId?: string;
  experiment?: string;
  from?: string;
  to?: string;
  gradeMin?: string;
  gradeMax?: string;
}

export interface AdminReportFilterOptions {
  schools: { id: number; name: string }[];
  classes: { id: string; name: string }[];
  teachers: { id: number; name: string }[];
  experiments: { name: string }[];
}

export interface AdminReportsAnalytics {
  total: number;
  graded: number;
  average: number;
  overdue: number;
  statusCounts: Record<string, number>;
  gradeDistribution: { range: string; count: number }[];
}

export interface AuditLogEntry {
  id: number;
  table_name: string;
  record_id: string;
  action: string;
  old_values?: string | null;
  new_values?: string | null;
  actor_id?: number | null;
  actor_name?: string;
  created_at: string;
}

export async function getAdminAuditLog() {
  return fetchJson<{ success: boolean; audit: AuditLogEntry[] }>('/api/admin/audit');
}

export async function getDetailedStats(period: string = 'today', signal?: AbortSignal) {
  const opts = signal ? { signal } : undefined;
  return fetchJson<{ success: boolean; stats: Record<string, unknown> }>(`/api/admin/detailed-stats?period=${period}`, opts);
}

export async function getAcademicTracking(signal?: AbortSignal) {
  const opts = signal ? { signal } : undefined;
  return fetchJson<{ success: boolean; tracking: Record<string, unknown> }>('/api/admin/academic-tracking', opts);
}

export async function getAdminDetailedReports(date?: string) {
  const query = date ? `?date=${date}` : '';
  return fetchJson<{ success: boolean; report: Record<string, unknown> }>(`/api/admin/detailed-reports${query}`);
}

export async function getAdminReports(params: AdminReportsParams = {}) {
  const {
    page = 1, limit = 50, search = '', status = '',
    schoolId = '', classId = '', teacherId = '', experiment = '',
    from = '', to = '', gradeMin = '', gradeMax = '',
  } = params;
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) qs.set('search', search);
  if (status) qs.set('status', status);
  if (schoolId) qs.set('schoolId', schoolId);
  if (classId) qs.set('classId', classId);
  if (teacherId) qs.set('teacherId', teacherId);
  if (experiment) qs.set('experiment', experiment);
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  if (gradeMin !== '') qs.set('gradeMin', gradeMin);
  if (gradeMax !== '') qs.set('gradeMax', gradeMax);
  return fetchJson<{ success: boolean; reports: AdminReportItem[]; total: number; page: number; limit: number; totalPages: number }>(`/api/admin/reports?${qs.toString()}`);
}

export async function getAdminReportFilters() {
  return fetchJson<{ success: boolean } & AdminReportFilterOptions>('/api/admin/reports/filters');
}

export async function getAdminReportsAnalytics() {
  return fetchJson<{ success: boolean; analytics: AdminReportsAnalytics }>('/api/admin/reports/analytics');
}

export async function getAdminClassStudents(classId: string) {
  return fetchJson<{ success: boolean; students: { id: number; name: string; email: string; joined_at: string; report_count: number }[] }>(`/api/admin/classes/${classId}/students`);
}

export async function updateAdminClass(classId: string, data: { name?: string; teacher_id?: number }) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/admin/classes/${classId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function freezeAdminClass(classId: string, reason: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/admin/classes/${classId}/freeze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
}

export async function unfreezeAdminClass(classId: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/admin/classes/${classId}/unfreeze`, { method: 'POST' });
}

export async function updateAdminReportGrade(reportId: number, grade: number, feedback?: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/admin/reports/${reportId}/grade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grade, feedback }),
  });
}

export async function getAdminTeachers(schoolId?: number) {
  const qs = schoolId ? `?schoolId=${schoolId}` : '';
  return fetchJson<{ success: boolean; teachers: { id: number; name: string; email: string }[] }>(`/api/admin/teachers${qs}`);
}

export async function getAdminSettings() {
  return fetchJson<{ success: boolean; settings: Record<string, string> }>('/api/admin/settings');
}

export async function updateAdminSetting(key: string, value: string) {
  return fetchJson<{ success: boolean }>('/api/admin/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
}

export async function updateAdminUser(userId: number, data: { name?: string; email?: string }) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function createAdminClass(name: string, code: string | undefined, teacherId: number) {
  return fetchJson<{ success: boolean; id?: number; code?: string; message?: string }>('/api/admin/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, code, teacher_id: teacherId }),
  });
}

export async function deleteAdminReport(reportId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/admin/reports/${reportId}`, { method: 'DELETE' });
}

export async function deleteAdminReports(reportIds: number[]) {
  return fetchJson<{ success: boolean; message?: string }>('/api/admin/reports/delete-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: reportIds }),
  });
}

export async function reassignReport(reportId: number, teacherId: number) {
  return fetchJson<{ success: boolean }>(`/api/admin/reports/${reportId}/reassign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teacher_id: teacherId }),
  });
}
