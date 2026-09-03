import { fetchJson } from './http';
import type { SchoolSessionItem, SchoolActivityItem } from './school.service';

export async function getSchoolSessions() {
  return fetchJson<{ success: boolean; sessions: SchoolSessionItem[] }>('/api/school/sessions');
}

export async function getSchoolExport(type: string) {
  const res = await fetch(`/api/school/export/${type}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Export failed');
  return res.text();
}

export async function getSchoolActivity() {
  return fetchJson<{ success: boolean; activity: SchoolActivityItem[] }>('/api/school/activity');
}
