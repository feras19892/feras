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
  target_id: string | number;
  target_type: string;
  rater_id: number;
  rater_type: string;
  rating: number;
  comment: string | null;
  created_at: string;
  rater_name?: string;
  target_name?: string;
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

export async function createRating(targetId: string | number, targetType: string, rating: number, comment?: string, signal?: AbortSignal) {
  return fetchJson<{ success: boolean; message?: string }>('/api/enh/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_id: targetId, target_type: targetType, rating, comment }),
    ...(signal ? { signal } : {}),
  });
}

export async function getRatings(targetType: string, targetId: string | number) {
  return fetchJson<{ success: boolean; ratings: Rating[]; average: number; count: number }>(`/api/enh/ratings/${targetType}/${targetId}`);
}

export async function getAllRatings() {
  return fetchJson<{ success: boolean; ratings: Rating[] }>('/api/enh/ratings/all');
}

export async function getMyRatings(signal?: AbortSignal) {
  const opts = signal ? { signal } : undefined;
  return fetchJson<{ success: boolean; given: Rating[]; received: Rating[]; average: number; count: number }>('/api/enh/ratings/my', opts);
}

export interface RatingStats {
  givenCount: number;
  receivedAvg: number;
  receivedCount: number;
}

export async function getRatingStats() {
  return fetchJson<{ success: boolean; stats: RatingStats }>('/api/enh/ratings/stats');
}

export async function getRatingTargets(signal?: AbortSignal) {
  const opts = signal ? { signal } : undefined;
  return fetchJson<{ success: boolean; targets: { teachers?: { id: number; name: string }[]; students?: { id: number; name: string }[]; classes?: { id: string; name: string }[]; school: number | null } }>('/api/enh/rating-targets', opts);
}

export async function getTeacherRecentActions() {
  return fetchJson<{ success: boolean; actions: Penalty[] }>('/api/enh/teacher/recent-actions');
}

export async function updateAvatar(avatarUrl: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/enh/avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatar_url: avatarUrl }),
  });
}
