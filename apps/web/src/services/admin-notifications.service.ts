import { fetchJson } from './http';

export type AdminTargetType = 'all' | 'role' | 'school' | 'class' | 'user';
export type AdminPriority = 'low' | 'normal' | 'immediate';

export interface AdminNotificationLog {
  id: number;
  admin_id: number;
  target_type: AdminTargetType;
  target_value: string | null;
  title: string;
  message: string;
  priority: AdminPriority;
  recipient_count: number;
  status: string;
  created_at: string;
}

export interface AdminNotificationInput {
  target_type: AdminTargetType;
  target_value?: string;
  title: string;
  message: string;
  priority?: AdminPriority;
}

export async function sendAdminNotification(data: AdminNotificationInput) {
  return fetchJson<{ success: boolean; id?: number; recipient_count?: number; message?: string }>('/api/admin/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getAdminNotifications(page = 1, limit = 20) {
  return fetchJson<{ success: boolean; logs: AdminNotificationLog[]; total: number; page: number; limit: number }>(
    `/api/admin/notifications?page=${page}&limit=${limit}`,
  );
}

export async function getAdminNotificationStats(id: number) {
  return fetchJson<{ success: boolean; stats: { read_count: number; total: number } }>(`/api/admin/notifications/${id}/stats`);
}

export async function deleteAdminNotification(id: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/admin/notifications/${id}`, { method: 'DELETE' });
}
