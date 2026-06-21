import { fetchJson } from './http';

export async function getAdminUsers() {
  return fetchJson<{ success: boolean; users: Record<string, unknown>[] }>('/api/admin/users');
}

export async function getAdminStats() {
  return fetchJson<{ success: boolean; stats: {
    users: { total: number; byRole: { role: string; count: number }[] };
    classes: { total: number };
    reports: { total: number; graded: number; pending: number; resubmitted: number; average: number };
  } }>('/api/admin/stats');
}

export async function getAdminClasses() {
  return fetchJson<{ success: boolean; classes: Record<string, unknown>[] }>('/api/admin/classes');
}

export async function getAdminReports() {
  return fetchJson<{ success: boolean; reports: Record<string, unknown>[] }>('/api/admin/reports');
}

export async function deleteUser(userId: number) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${userId}`, { method: 'DELETE' });
}

export async function updateUserRole(userId: number, role: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
}

export async function createAdminUser(name: string, email: string, password: string, role: string) {
  return fetchJson<{ success: boolean; id?: number }>('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function deleteAdminClass(classId: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/classes/${classId}`, { method: 'DELETE' });
}

export async function getAdminActivity() {
  return fetchJson<{ success: boolean; activities: Record<string, unknown>[] }>('/api/admin/activity');
}

export async function getAdminActivityStats() {
  return fetchJson<{ success: boolean; stats: Record<string, unknown> }>('/api/admin/activity/stats');
}

export async function getAdminInsights() {
  return fetchJson<{ success: boolean; insights: Record<string, unknown> }>('/api/admin/insights');
}

export async function getAdminFeedback() {
  return fetchJson<{ success: boolean; feedback: Record<string, unknown>[]; stats: Record<string, unknown> }>('/api/admin/feedback');
}

export async function updateFeedbackStatus(id: number, status: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/feedback/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function submitFeedback(type: string, message: string, experimentId?: string, experimentName?: string, rating?: number) {
  return fetchJson<{ success: boolean }>('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, message, experimentId, experimentName, rating }),
  });
}

export async function getAdminUserFull(userId: number) {
  return fetchJson<Record<string, unknown>>(`/api/admin/users/${userId}/full`);
}

export async function banUser(userId: number, reason: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${userId}/ban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
}

export async function unbanUser(userId: number) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${userId}/unban`, { method: 'POST' });
}

export async function sendAdminWarning(userId: number, title: string, message: string, severity: string) {
  return fetchJson<{ success: boolean }>('/api/admin/warnings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, title, message, severity }),
  });
}

export async function getAdminWarnings() {
  return fetchJson<{ success: boolean; warnings: Record<string, unknown>[] }>('/api/admin/warnings');
}

export async function addAdminNote(userId: number, note: string) {
  return fetchJson<{ success: boolean }>('/api/admin/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, note }),
  });
}

export async function getAdminSystemHealth() {
  return fetchJson<{ success: boolean; health: Record<string, unknown> }>('/api/admin/health');
}

export async function getAdminExport(type: string) {
  const res = await fetch(`/api/admin/export/${type}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Export failed');
  return res.text();
}

export async function impersonateUser(userId: number) {
  return fetchJson<{ success: boolean; token: string; user: Record<string, unknown> }>(`/api/admin/impersonate/${userId}`, { method: 'POST' });
}

export async function resetUserPassword(userId: number, password: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${userId}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}
