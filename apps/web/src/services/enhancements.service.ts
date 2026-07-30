import { fetchJson } from './http';

export interface Penalty {
  id: number;
  student_id: number;
  teacher_id: number;
  class_id: string | null;
  type: 'penalty' | 'reward';
  reason: string;
  points: number;
  status: string;
  created_at: string;
  teacher_name?: string;
  student_name?: string;
  class_name?: string | null;
}

export interface Rating {
  id: number;
  target_id: number;
  target_type: string;
  rater_id: number;
  rater_type: string;
  rating: number;
  comment: string | null;
  created_at: string;
  rater_name?: string;
}

export async function createPenalty(studentId: number, type: 'penalty' | 'reward', reason: string, points: number, classId?: string) {
  return fetchJson<{ success: boolean; penalty?: Penalty; message?: string }>('/api/enh/penalties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId, type, reason, points, class_id: classId }),
  });
}

export async function getMyPenalties() {
  return fetchJson<{ success: boolean; penalties: Penalty[] }>('/api/enh/penalties/my');
}

export async function getStudentPenalties(studentId: number) {
  return fetchJson<{ success: boolean; penalties: Penalty[] }>(`/api/enh/penalties/student/${studentId}`);
}

export async function getClassPenalties(classId: string) {
  return fetchJson<{ success: boolean; penalties: Penalty[] }>(`/api/enh/penalties/class/${classId}`);
}

export async function dismissPenalty(id: number) {
  return fetchJson<{ success: boolean }>(`/api/enh/penalties/${id}/dismiss`, { method: 'PATCH' });
}

export async function deletePenalty(id: number) {
  return fetchJson<{ success: boolean }>(`/api/enh/penalties/${id}`, { method: 'DELETE' });
}

export async function getAllPenalties() {
  return fetchJson<{ success: boolean; penalties: Penalty[] }>('/api/enh/penalties/all');
}

export async function createRating(targetId: number, targetType: string, rating: number, comment?: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/enh/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_id: targetId, target_type: targetType, rating, comment }),
  });
}

export async function getRatings(targetType: string, targetId: number) {
  return fetchJson<{ success: boolean; ratings: Rating[]; average: number; count: number }>(`/api/enh/ratings/${targetType}/${targetId}`);
}

export async function getAllRatings() {
  return fetchJson<{ success: boolean; ratings: Rating[] }>('/api/enh/ratings/all');
}

export async function updateAvatar(avatarUrl: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/enh/avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatar_url: avatarUrl }),
  });
}
