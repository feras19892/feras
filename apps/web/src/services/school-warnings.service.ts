import { fetchJson } from './http';
import type { SchoolWarningItem } from './school.service';

export async function createSchoolWarning(userId: number, title: string, message: string, severity: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/school/warnings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, title, message, severity }),
  });
}

export async function getSchoolWarnings() {
  return fetchJson<{ success: boolean; warnings: SchoolWarningItem[] }>('/api/school/warnings');
}

export async function reportToAdmin(userId: number, reason: string, details: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/school/report-to-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, reason, details }),
  });
}
