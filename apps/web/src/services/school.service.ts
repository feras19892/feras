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
  blocked_at?: string | null;
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
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Registration failed' };
  }
}

export async function loginSchool(email: string, password: string): Promise<{ success: boolean; school?: School; message?: string }> {
  try {
    return await fetchJson<{ success: boolean; school?: School; message?: string }>('/api/school/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch (err: unknown) {
    return { success: false, school: undefined, message: err instanceof Error ? err.message : 'Login failed' };
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

export async function getSchoolUsers(page = 1, limit = 50) {
  return fetchJson<{ success: boolean; users: SchoolUser[]; total: number; page: number; limit: number; totalPages: number }>(`/api/school/users?page=${page}&limit=${limit}`);
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

export interface SchoolReportItem {
  id: number;
  student_name: string;
  experiment_name: string;
  class_name?: string;
  status: string;
  grade?: number | null;
  submitted_at?: string;
  created_at: string;
}

export async function getSchoolReports(page = 1, limit = 50) {
  return fetchJson<{ success: boolean; reports: SchoolReportItem[]; total: number; page: number; limit: number; totalPages: number }>(`/api/school/reports?page=${page}&limit=${limit}`);
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
export interface SchoolUserDetail {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  blocked_at?: string | null;
  email_verified_at?: string | null;
  school_id?: number;
  block_reason?: string | null;
}

export interface SchoolUserDetailResult {
  success: boolean;
  user: SchoolUserDetail;
  joinedClasses: SchoolClass[];
  taughtClasses: SchoolClass[];
  reports: SchoolReportItem[];
  activity: SchoolActivityItem[];
  sessions: SchoolSessionItem[];
  warnings: SchoolWarningItem[];
  stats: { report_count: number; avg_grade: number; last_activity?: string };
}

export interface SchoolActivityItem {
  id: number;
  action: string;
  actor_name: string;
  details?: string;
  created_at: string;
}

export interface SchoolSessionItem {
  id: number;
  user_name: string;
  user_role: string;
  ip?: string;
  user_agent?: string;
  login_at: string;
  logout_at?: string | null;
}

export interface SchoolWarningItem {
  id: number;
  user_id?: number;
  user_name: string;
  user_role: string;
  title: string;
  message: string;
  severity: string;
  is_read?: boolean;
  created_at: string;
}

export async function getSchoolUserDetail(userId: number) {
  return fetchJson<SchoolUserDetailResult>(`/api/school/users/${userId}/detail`);
}

export interface SchoolClassDetailResult {
  success: boolean;
  class: SchoolClass;
  students: SchoolUser[];
  messages: { id: number; user_name: string; content: string; created_at: string }[];
  reports: SchoolReportItem[];
  stats: { report_count: number; graded_count: number; pending_count: number; class_average: number };
}

export async function getSchoolClassDetail(classId: string) {
  return fetchJson<SchoolClassDetailResult>(`/api/school/classes/${classId}/detail`);
}

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

export {
  adminUpdateSchool, adminDeleteSchool,
  adminGetSchoolUsers, adminGetSchoolClasses, adminGetSchoolReports,
  adminRemoveSchoolUser, adminBlockSchoolUser, adminUnblockSchoolUser,
  adminGetEmailRequests, adminReviewEmailRequest,
  adminGetCapacityRequests, schoolCreateCapacityRequest, getSchoolCapacityRequests, adminReviewCapacityRequest,
  type EmailChangeRequest, type CapacityRequest,
} from './school-admin.service';

export {
  getSchoolDetailedReports, getOutstandingStudents, getStrugglingStudents,
  getTeacherEvaluation,
  type SchoolDetailedReport, type OutstandingStudent, type StrugglingStudent, type TeacherEvaluation,
  getSchoolFeedback, updateSchoolFeedbackStatus,
  type SchoolFeedbackItem, type SchoolFeedbackStats,
} from './school-reports.service';
