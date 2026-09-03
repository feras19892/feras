import { fetchJson } from './http';
import type {
  AdminUser,
  AdminClassItem,
  AdminFeedbackItem,
  AdminFeedbackStats,
  AdminStats,
  AdminActivityItem,
  AdminActivityStats,
  AdminInsights,
  AdminSystemHealth,
  AdminUserWarning,
  AdminUserFull,
  ActiveSession,
} from './admin.types';
export * from './admin.types';

export async function getAdminUsers(page = 1, limit = 50) {
  return fetchJson<{ success: boolean; users: AdminUser[]; total: number; page: number; limit: number; totalPages: number }>(`/api/admin/users?page=${page}&limit=${limit}`);
}

export async function getAdminStats() {
  return fetchJson<{ success: boolean; stats: AdminStats }>('/api/admin/stats');
}

export async function getAdminClasses() {
  return fetchJson<{ success: boolean; classes: AdminClassItem[] }>('/api/admin/classes');
}

export async function deleteUser(userId: number, adminPassword: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/admin/users/${userId}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_password: adminPassword }),
  });
}

export async function updateUserRole(userId: number, role: string, adminPassword: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, admin_password: adminPassword }),
  });
}

export async function createAdminUser(name: string, email: string, password: string, role: string) {
  return fetchJson<{ success: boolean; id?: number; message?: string }>('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function deleteAdminClass(classId: string, adminPassword: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/classes/${classId}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_password: adminPassword }),
  });
}

export async function getAdminActivity() {
  return fetchJson<{ success: boolean; activities: AdminActivityItem[] }>('/api/admin/activity');
}

export async function getAdminActivityStats() {
  return fetchJson<{ success: boolean; stats: AdminActivityStats }>('/api/admin/activity/stats');
}

export async function getAdminInsights(signal?: AbortSignal) {
  const opts = signal ? { signal } : undefined;
  return fetchJson<{ success: boolean; insights: AdminInsights }>('/api/admin/insights', opts);
}

export async function getAdminFeedback() {
  return fetchJson<{ success: boolean; feedback: AdminFeedbackItem[]; stats: AdminFeedbackStats }>('/api/admin/feedback');
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
  return fetchJson<AdminUserFull>(`/api/admin/users/${userId}/full`);
}

export async function extendAdminUserTrial(userId: number, days: number) {
  return fetchJson<{ success: boolean; expires_at: string }>(`/api/admin/users/${userId}/extend-trial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days }),
  });
}

export async function changeAdminUserSubscription(userId: number, data: { status?: string; plan_id?: number | null }) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${userId}/subscription`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function banUser(userId: number, reason: string, adminPassword: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${userId}/ban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, admin_password: adminPassword }),
  });
}

export async function unbanUser(userId: number, adminPassword: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${userId}/unban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_password: adminPassword }),
  });
}

export async function deleteAllNonAdminUsers(password: string) {
  return fetchJson<{ success: boolean; count: number; remaining: number }>('/api/admin/users/delete-non-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}

export async function sendAdminWarning(userId: number, title: string, message: string, severity: string) {
  return fetchJson<{ success: boolean }>('/api/admin/warnings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, title, message, severity }),
  });
}

export async function getAdminWarnings() {
  return fetchJson<{ success: boolean; warnings: AdminUserWarning[] }>('/api/admin/warnings');
}

export async function addAdminNote(userId: number, note: string) {
  return fetchJson<{ success: boolean }>('/api/admin/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, note }),
  });
}

export async function getAdminSystemHealth(signal?: AbortSignal) {
  const opts = signal ? { signal } : undefined;
  return fetchJson<{ success: boolean; health: AdminSystemHealth }>('/api/admin/health', opts);
}

export async function getAdminExport(type: string) {
  const res = await fetch(`/api/admin/export/${type}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Export failed');
  return res.text();
}

export async function impersonateUser(userId: number, password: string) {
  return fetchJson<{ success: boolean; token: string; refreshToken: string; user: AdminUser }>(`/api/admin/impersonate/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}

export async function resetUserPassword(userId: number, password: string, adminPassword: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${userId}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, admin_password: adminPassword }),
  });
}

export {
  getAdminAuditLog, getDetailedStats, getAcademicTracking, getAdminDetailedReports, getAdminReports,
  getAdminReportFilters, getAdminReportsAnalytics, getAdminClassStudents, updateAdminClass, freezeAdminClass,
  unfreezeAdminClass, updateAdminReportGrade, getAdminTeachers, getAdminSettings, updateAdminSetting,
  updateAdminUser, createAdminClass, deleteAdminReport, deleteAdminReports, reassignReport,
  type AuditLogEntry, type AdminReportsParams, type AdminReportFilterOptions, type AdminReportsAnalytics,
} from './admin-reports.service';

export {
  sendDirectMessage, getConversation, getConversations, getUnreadMessageCount, markAllMessagesRead,
  type DirectMessage, type ConversationItem,
} from './admin-messages.service';

export async function triggerBackup() {
  return fetchJson<{ success: boolean; message?: string }>('/api/admin/backup', { method: 'POST' });
}

export async function restoreBackup(filename: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/admin/backup/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });
}

export async function cleanupDB() {
  return fetchJson<{ success: boolean; message?: string }>('/api/admin/db/cleanup', { method: 'POST' });
}

export async function listBackups() {
  return fetchJson<{ success: boolean; backups: { name: string; size: number; created: string }[] }>('/api/admin/backups');
}

export async function getActiveSessions() {
  return fetchJson<{ success: boolean; sessions: ActiveSession[] }>('/api/admin/sessions');
}
