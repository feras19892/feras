import { fetchJson } from './http';

export interface ClassItem {
  id: string;
  name: string;
  code: string;
  is_active: number;
  created_at: string;
}

export interface ClassStudent {
  id: number;
  name: string;
  email: string;
  joined_at: string;
}

export async function createClass(name: string) {
  return fetchJson<{ success: boolean; class: ClassItem }>('/api/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

export async function getMyClasses() {
  return fetchJson<{ success: boolean; classes: ClassItem[] }>('/api/classes');
}

export async function getClassDetails(id: string) {
  return fetchJson<{ success: boolean; class: ClassItem; students: ClassStudent[] }>(`/api/classes/${id}`);
}

export async function joinClass(code: string) {
  return fetchJson<{ success: boolean; class_id?: string; name?: string; message?: string }>('/api/classes/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
}

export async function deleteClass(id: string) {
  return fetchJson<{ success: boolean }>(`/api/classes/${id}`, { method: 'DELETE' });
}

export async function leaveClass(id: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/classes/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ class_id: id }),
  });
}

export async function getPendingCount() {
  return fetchJson<{ success: boolean; pendingCount: number }>('/api/classes/stats/pending');
}

export async function getClassStats(id: string) {
  return fetchJson<{ success: boolean; stats: {
    student_count: number;
    total_reports: number;
    graded_count: number;
    pending_count: number;
    class_average: number;
    top_students: { student_id: number; avg: number; report_count: number }[];
  } }>(`/api/classes/${id}/stats`);
}

export async function updateClass(id: string, data: { name?: string; is_active?: boolean }) {
  return fetchJson<{ success: boolean }>(`/api/classes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
