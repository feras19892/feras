import { fetchJson } from './http';

export interface Announcement {
  id: number;
  author_type: string;
  author_id: number;
  author_name: string;
  scope: string;
  class_id: string | null;
  school_id: number | null;
  title: string;
  content: string;
  is_pinned: number;
  expires_at: string | null;
  created_at: string;
}

export async function getAnnouncements() {
  return fetchJson<{ success: boolean; announcements: Announcement[] }>('/api/announcements');
}

export async function getClassAnnouncements(classId: string) {
  return fetchJson<{ success: boolean; announcements: Announcement[] }>(`/api/announcements/class/${classId}`);
}

export async function createAnnouncement(data: {
  scope: 'class' | 'school' | 'global';
  class_id?: string;
  school_id?: number;
  title: string;
  content: string;
  is_pinned?: boolean;
  expires_at?: string;
}) {
  return fetchJson<{ success: boolean; announcement: Announcement }>('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteAnnouncement(id: number) {
  return fetchJson<{ success: boolean }>(`/api/announcements/${id}`, { method: 'DELETE' });
}
