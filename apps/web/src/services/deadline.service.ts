import { fetchJson } from './http';

export interface Deadline {
  id: number;
  class_id: string;
  experiment_name: string;
  experiment_id: string | null;
  due_at: string;
  created_by: number;
  created_at: string;
}

export async function getClassDeadlines(classId: string) {
  return fetchJson<{ success: boolean; deadlines: Deadline[] }>(`/api/deadlines/class/${classId}`);
}

export async function getStudentDeadlines() {
  return fetchJson<{ success: boolean; deadlines: Deadline[] }>('/api/deadlines/student');
}

export async function setDeadline(data: {
  class_id: string;
  experiment_name: string;
  experiment_id?: string;
  due_at: string;
}) {
  return fetchJson<{ success: boolean; deadline: Deadline }>('/api/deadlines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteDeadline(id: number) {
  return fetchJson<{ success: boolean }>(`/api/deadlines/${id}`, { method: 'DELETE' });
}
