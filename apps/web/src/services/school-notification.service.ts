import { fetchJson } from './http';

export interface SchoolNotification {
  id: number;
  school_id: number;
  type: string;
  title: string;
  message: string | null;
  is_read: number;
  is_pinned?: number;
  created_at: string;
}

export async function getSchoolNotifications(): Promise<{ success: boolean; notifications: SchoolNotification[] }> {
  return fetchJson('/api/school/notifications');
}

export async function getSchoolUnreadCount(): Promise<{ success: boolean; count: number }> {
  return fetchJson('/api/school/notifications/unread-count');
}

export async function markSchoolNotificationRead(id: number): Promise<{ success: boolean }> {
  return fetchJson(`/api/school/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllSchoolNotificationsRead(): Promise<{ success: boolean }> {
  return fetchJson('/api/school/notifications/read-all', { method: 'PATCH' });
}

export async function deleteSchoolNotification(id: number): Promise<{ success: boolean }> {
  return fetchJson(`/api/school/notifications/${id}`, { method: 'DELETE' });
}

export async function pinSchoolNotification(id: number): Promise<{ success: boolean; is_pinned?: number }> {
  return fetchJson(`/api/school/notifications/${id}/pin`, { method: 'PATCH' });
}
