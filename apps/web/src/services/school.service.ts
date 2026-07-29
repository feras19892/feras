import { fetchJson } from './http';

export interface School {
  id: number;
  email: string;
  name: string;
  code: string;
  max_students: number;
  max_teachers: number;
  is_active: boolean;
  created_at?: string;
}

export interface SchoolStats {
  students: number;
  teachers: number;
  classes: number;
  reports: number;
}

export interface SchoolUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  code: string;
  teacher_name: string;
  student_count: number;
  created_at: string;
  is_frozen?: number;
}

export async function registerSchool(name: string, email: string, password: string, maxStudents: number, maxTeachers: number): Promise<{ success: boolean; school?: School; code?: string; message?: string }> {
  try {
    return await fetchJson<{ success: boolean; school?: School; code?: string; message?: string }>('/api/school/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, max_students: maxStudents, max_teachers: maxTeachers }),
    });
  } catch (err: any) {
    return { success: false, message: err?.message || 'Registration failed' };
  }
}

export async function loginSchool(email: string, password: string) {
  try {
    return await fetchJson<{ success: boolean; school?: School; message?: string }>('/api/school/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (err: any) {
    return { success: false, message: err?.message || 'Login failed' };
  }
}

export async function logoutSchool() {
  return fetchJson<{ success: boolean }>('/api/school/logout', {
    method: 'POST',
  });
}

export async function getSchoolProfile() {
  return fetchJson<{ success: boolean; school: School }>('/api/school/me');
}

export async function getSchoolStats() {
  return fetchJson<{ success: boolean; stats: SchoolStats; school: School }>('/api/school/stats');
}

export async function getSchoolUsers() {
  return fetchJson<{ success: boolean; users: SchoolUser[] }>('/api/school/users');
}

export async function getSchoolClasses() {
  return fetchJson<{ success: boolean; classes: SchoolClass[] }>('/api/school/classes');
}

export async function removeSchoolUser(userId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function blockSchoolUser(userId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/users/${userId}/block`, {
    method: 'PATCH',
  });
}

export async function unblockSchoolUser(userId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/users/${userId}/unblock`, {
    method: 'PATCH',
  });
}

export async function getSchoolReports() {
  return fetchJson<{ success: boolean; reports: any[] }>('/api/school/reports');
}

export async function updateSchoolName(name: string) {
  return fetchJson<{ success: boolean; message?: string; school?: School }>('/api/school/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

export async function changeSchoolPassword(currentPassword: string, newPassword: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/school/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export async function requestEmailChange(requestedEmail: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/school/email-change-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requested_email: requestedEmail }),
  });
}

// ===== School Oversight Functions =====
export async function getSchoolUserDetail(userId: number) {
  return fetchJson<{ success: boolean; user: any; joinedClasses: any[]; taughtClasses: any[]; reports: any[]; activity: any[]; sessions: any[]; warnings: any[]; stats: any }>(`/api/school/users/${userId}/detail`);
}

export async function getSchoolClassDetail(classId: string) {
  return fetchJson<{ success: boolean; class: any; students: any[]; messages: any[]; reports: any[]; stats: any }>(`/api/school/classes/${classId}/detail`);
}

export async function createSchoolWarning(userId: number, title: string, message: string, severity: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/school/warnings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, title, message, severity }),
  });
}

export async function getSchoolWarnings() {
  return fetchJson<{ success: boolean; warnings: any[] }>('/api/school/warnings');
}

export async function reportToAdmin(userId: number, reason: string, details: string) {
  return fetchJson<{ success: boolean; message?: string }>('/api/school/report-to-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, reason, details }),
  });
}

export async function getSchoolSessions() {
  return fetchJson<{ success: boolean; sessions: any[] }>('/api/school/sessions');
}

export async function getSchoolActivity() {
  return fetchJson<{ success: boolean; activity: any[] }>('/api/school/activity');
}

// ===== Admin functions =====
export interface AdminSchool {
  id: number;
  email: string;
  name: string;
  code: string;
  max_students: number;
  max_teachers: number;
  is_active: boolean;
  created_at: string;
  student_count: number;
  teacher_count: number;
}

export async function adminGetAllSchools() {
  return fetchJson<{ success: boolean; schools: AdminSchool[] }>('/api/school/admin/all');
}

export async function adminToggleSchool(id: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/admin/${id}/toggle`, {
    method: 'PATCH',
  });
}

export async function adminGetSchoolDetail(id: number) {
  return fetchJson<{ success: boolean; school: School; stats: SchoolStats }>(`/api/school/admin/${id}`);
}

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
  return fetchJson<{ success: boolean; reports: any[] }>(`/api/school/admin/${id}/reports`);
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

export async function adminGetEmailRequests() {
  return fetchJson<{ success: boolean; requests: any[] }>('/api/school/admin/email-requests');
}

export async function adminReviewEmailRequest(id: number, status: 'approved' | 'rejected') {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/admin/email-requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}
