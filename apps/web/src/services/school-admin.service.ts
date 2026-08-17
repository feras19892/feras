import { fetchJson } from './http';
import type { SchoolUser, SchoolClass, SchoolReportItem } from './school.service';

export async function adminUpdateSchool(id: number, updates: { name?: string; email?: string; max_students?: number; max_teachers?: number }) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/admin/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function adminDeleteSchool(id: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/admin/${id}`, {
    method: 'DELETE',
  });
}

export async function adminGetSchoolUsers(id: number) {
  return fetchJson<{ success: boolean; users: SchoolUser[] }>(`/api/school/admin/${id}/users`);
}

export async function adminGetSchoolClasses(id: number) {
  return fetchJson<{ success: boolean; classes: SchoolClass[] }>(`/api/school/admin/${id}/classes`);
}

export async function adminGetSchoolReports(id: number) {
  return fetchJson<{ success: boolean; reports: SchoolReportItem[] }>(`/api/school/admin/${id}/reports`);
}

export async function adminRemoveSchoolUser(schoolId: number, userId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/admin/${schoolId}/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function adminBlockSchoolUser(schoolId: number, userId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/admin/${schoolId}/users/${userId}/block`, {
    method: 'PATCH',
  });
}

export async function adminUnblockSchoolUser(schoolId: number, userId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/admin/${schoolId}/users/${userId}/unblock`, {
    method: 'PATCH',
  });
}

export interface EmailChangeRequest {
  id: number;
  account_type: string;
  account_id: number;
  current_email: string;
  requested_email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export async function adminGetEmailRequests() {
  return fetchJson<{ success: boolean; requests: EmailChangeRequest[] }>('/api/school/admin/email-requests');
}

export async function adminReviewEmailRequest(id: number, status: 'approved' | 'rejected') {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/admin/email-requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export interface CapacityRequest {
  id: number;
  school_id: number;
  school_name: string;
  current_max_students: number;
  current_max_teachers: number;
  requested_max_students?: number;
  requested_max_teachers?: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  response?: string;
  created_at: string;
}

export async function adminGetCapacityRequests(status?: string) {
  const query = status ? `?status=${status}` : '';
  return fetchJson<{ success: boolean; requests: CapacityRequest[] }>(`/api/school/admin/capacity-requests${query}`);
}

export async function schoolCreateCapacityRequest(data: {
  requested_max_students?: number;
  requested_max_teachers?: number;
  reason: string;
}) {
  return fetchJson<{ success: boolean; message?: string }>('/api/school/capacity-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getSchoolCapacityRequests(status?: string) {
  const query = status ? `?status=${status}` : '';
  return fetchJson<{ success: boolean; requests: CapacityRequest[] }>(`/api/school/capacity-requests${query}`);
}

export async function adminReviewCapacityRequest(id: number, status: 'approved' | 'rejected', response?: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/admin/capacity-requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, response }),
  });
}
