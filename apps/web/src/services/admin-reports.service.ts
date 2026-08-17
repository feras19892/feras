import { fetchJson } from './http';

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

export async function getDetailedStats(period: string = 'today') {
  return fetchJson<{ success: boolean; stats: Record<string, unknown> }>(`/api/admin/detailed-stats?period=${period}`);
}

export async function getAcademicTracking() {
  return fetchJson<{ success: boolean; tracking: Record<string, unknown> }>('/api/admin/academic-tracking');
}

export async function getAdminDetailedReports(date?: string) {
  const query = date ? `?date=${date}` : '';
  return fetchJson<{ success: boolean; report: Record<string, unknown> }>(`/api/admin/detailed-reports${query}`);
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

export async function updateAdminReportGrade(reportId: number, grade: number, feedback?: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/admin/reports/${reportId}/grade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grade, feedback }),
  });
}

export async function getAdminTeachers() {
  return fetchJson<{ success: boolean; teachers: { id: number; name: string; email: string }[] }>('/api/admin/teachers');
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
