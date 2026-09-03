import { fetchJson } from './http';

export interface SchoolNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: number | boolean;
  is_pinned: number | boolean;
  priority: string;
  created_at: string;
}

export async function getSchoolNotifications() {
  return fetchJson<{ success: boolean; notifications: SchoolNotification[] }>('/api/school/notifications');
}

export async function markSchoolNotificationRead(id: number) {
  return fetchJson<{ success: boolean }>(`/api/school/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllSchoolNotificationsRead() {
  return fetchJson<{ success: boolean }>('/api/school/notifications/read-all', { method: 'PATCH' });
}

export async function deleteSchoolNotification(id: number) {
  return fetchJson<{ success: boolean }>(`/api/school/notifications/${id}`, { method: 'DELETE' });
}

export async function togglePinSchoolNotification(id: number) {
  return fetchJson<{ success: boolean; is_pinned?: boolean }>(`/api/school/notifications/${id}/pin`, { method: 'PATCH' });
}
