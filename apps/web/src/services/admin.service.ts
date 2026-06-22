import { fetchJson } from './http';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  email_verified_at?: string;
  blocked_at?: string | null;
  block_reason?: string | null;
}

export interface AdminClassItem {
  id: string;
  name: string;
  code: string;
  teacher_name: string;
  student_count: number;
  created_at?: string;
}

export interface AdminReportItem {
  id: number;
  student_name: string;
  experiment_name: string;
  class_name: string;
  teacher_name: string;
  status: string;
  grade?: number | null;
  submitted_at?: string;
}

export interface AdminFeedbackItem {
  id: number;
  type: string;
  user_name: string;
  experiment_name?: string;
  rating?: number | null;
  message: string;
  status: string;
  created_at?: string;
}

export interface AdminFeedbackStats {
  total: number;
  open: number;
  resolved: number;
  average: number;
}

export interface AdminStats {
  users: { total: number; byRole: { role: string; count: number }[] };
  classes: { total: number };
  reports: { total: number; graded: number; pending: number; resubmitted: number; average: number };
}

export interface AdminActivityItem {
  id: number;
  action: string;
  actor_name: string;
  actor_role: string;
  target_type?: string;
  target_id?: number;
  created_at?: string;
}

export interface AdminActivityStats {
  today: number;
  logins: number;
  signups: number;
  reports: number;
}

export interface AdminInsights {
  topUsers?: { id: number; name: string; role: string; report_count: number }[];
  recentActivity?: { actor_name: string; action: string; created_at?: string }[];
  inactiveUsers?: { id: number; name: string; role: string }[];
  emptyClasses?: { id: number; name: string; teacher_name: string }[];
  ungradedCount?: number;
  noReportsTeachers?: { id: number; name: string }[];
}

export interface AdminSystemHealth {
  counts: { users: number; classes: number; reports: number; sessions: number };
  today: { logins: number; signups: number; reports: number };
  dbSize: number;
  tables: Record<string, number>;
}

export interface AdminUserWarning {
  id: number;
  title: string;
  severity: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminNote {
  id: number;
  admin_name: string;
  note: string;
  created_at: string;
}

export interface AdminUserActivity {
  action: string;
  details?: string;
  created_at: string;
}

export interface AdminUserFull {
  success: boolean;
  user: AdminUser;
  classes?: AdminClassItem[];
  reports?: AdminReportItem[];
  warnings?: AdminUserWarning[];
  notes?: AdminNote[];
  activity?: AdminUserActivity[];
}

export async function getAdminUsers() {
  return fetchJson<{ success: boolean; users: AdminUser[] }>('/api/admin/users');
}

export async function getAdminStats() {
  return fetchJson<{ success: boolean; stats: AdminStats }>('/api/admin/stats');
}

export async function getAdminClasses() {
  return fetchJson<{ success: boolean; classes: AdminClassItem[] }>('/api/admin/classes');
}

export async function getAdminReports() {
  return fetchJson<{ success: boolean; reports: AdminReportItem[] }>('/api/admin/reports');
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
  return fetchJson<{ success: boolean; activities: AdminActivityItem[] }>('/api/admin/activity');
}

export async function getAdminActivityStats() {
  return fetchJson<{ success: boolean; stats: AdminActivityStats }>('/api/admin/activity/stats');
}

export async function getAdminInsights() {
  return fetchJson<{ success: boolean; insights: AdminInsights }>('/api/admin/insights');
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
  return fetchJson<{ success: boolean; warnings: AdminUserWarning[] }>('/api/admin/warnings');
}

export async function addAdminNote(userId: number, note: string) {
  return fetchJson<{ success: boolean }>('/api/admin/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, note }),
  });
}

export async function getAdminSystemHealth() {
  return fetchJson<{ success: boolean; health: AdminSystemHealth }>('/api/admin/health');
}

export async function getAdminExport(type: string) {
  const res = await fetch(`/api/admin/export/${type}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Export failed');
  return res.text();
}

export async function impersonateUser(userId: number) {
  return fetchJson<{ success: boolean; token: string; user: AdminUser }>(`/api/admin/impersonate/${userId}`, { method: 'POST' });
}

export async function resetUserPassword(userId: number, password: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${userId}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}
