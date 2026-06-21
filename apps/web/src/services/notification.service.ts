import { fetchJson } from './http';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message?: string;
  report_id?: number;
  class_id?: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications() {
  return fetchJson<{ success: boolean; notifications: Notification[] }>('/api/notifications');
}

export async function getUnreadCount() {
  return fetchJson<{ success: boolean; count: number }>('/api/notifications/unread-count');
}

export async function markAsRead(id: number) {
  return fetchJson<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllAsRead() {
  return fetchJson<{ success: boolean }>('/api/notifications/read-all', { method: 'PATCH' });
}

export async function deleteNotification(id: number) {
  return fetchJson<{ success: boolean }>(`/api/notifications/${id}`, { method: 'DELETE' });
}
