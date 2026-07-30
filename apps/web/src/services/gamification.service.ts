import { fetchJson } from './http';

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: string;
  criteria: string | null;
}

export interface StudentBadge {
  id: number;
  student_id: number;
  badge_id: number;
  awarded_by: number | null;
  awarded_by_type: string;
  note: string | null;
  awarded_at: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  awarded_by_name: string | null;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  avatar_url: string | null;
  avg_grade: number;
  report_count: number;
  quiz_scores: number;
  total_points: number;
}

export async function getAllBadges() {
  return fetchJson<{ success: boolean; badges: Badge[] }>('/api/game/badges');
}

export async function createBadge(name: string, description: string, icon: string, type: string, criteria?: string) {
  return fetchJson<{ success: boolean; badge?: Badge }>('/api/game/badges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, icon, type, criteria }),
  });
}

export async function deleteBadge(id: number) {
  return fetchJson<{ success: boolean }>(`/api/game/badges/${id}`, { method: 'DELETE' });
}

export async function awardBadge(studentId: number, badgeId: number, note?: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/game/badges/award', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId, badge_id: badgeId, note }),
  });
}

export async function removeBadge(studentId: number, badgeId: number) {
  return fetchJson<{ success: boolean }>('/api/game/badges/award', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId, badge_id: badgeId }),
  });
}

export async function getMyBadges() {
  return fetchJson<{ success: boolean; badges: StudentBadge[] }>('/api/game/badges/my');
}

export async function getStudentBadges(studentId: number) {
  return fetchJson<{ success: boolean; badges: StudentBadge[] }>(`/api/game/badges/student/${studentId}`);
}

export async function getLeaderboard(classId: string) {
  return fetchJson<{ success: boolean; leaderboard: LeaderboardEntry[]; myRank: number | null }>(`/api/game/leaderboard/${classId}`);
}
