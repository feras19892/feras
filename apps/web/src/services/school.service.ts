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

export async function adminReviewCapacityRequest(id: number, status: 'approved' | 'rejected', response?: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/school/admin/capacity-requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, response }),
  });
}

// ─── School Detailed Reports ───
export interface SchoolDetailedReport {
  date: string;
  total_reports: number;
  graded_reports: number;
  pending_reports: number;
  avg_grade: number;
  by_class: { class_name: string; report_count: number; avg_grade: number }[];
}

export async function getSchoolDetailedReports(date?: string) {
  const query = date ? `?date=${date}` : '';
  return fetchJson<{ success: boolean; report: SchoolDetailedReport }>(`/api/school/reports/detailed${query}`);
}

export interface OutstandingStudent {
  id: number;
  name: string;
  class_name: string;
  avg_grade: number;
  report_count: number;
}

export async function getOutstandingStudents(limit?: number) {
  const query = limit ? `?limit=${limit}` : '';
  return fetchJson<{ success: boolean; students: OutstandingStudent[] }>(`/api/school/reports/outstanding-students${query}`);
}

export async function getStrugglingStudents(limit?: number) {
  const query = limit ? `?limit=${limit}` : '';
  return fetchJson<{ success: boolean; students: OutstandingStudent[] }>(`/api/school/reports/struggling-students${query}`);
}

export interface TeacherEvaluation {
  teacher_id: number;
  teacher_name: string;
  class_count: number;
  student_count: number;
  total_reports: number;
  graded_reports: number;
  avg_grade: number;
}

export async function getTeacherEvaluation() {
  return fetchJson<{ success: boolean; evaluations: TeacherEvaluation[] }>('/api/school/reports/teacher-evaluation');
}

// ─── School Feedback ───
export interface SchoolFeedbackItem {
  id: number;
  type: string;
  user_name: string;
  experiment_name?: string;
  rating?: number | null;
  message: string;
  status: string;
  created_at: string;
}

export interface SchoolFeedbackStats {
  total: number;
  open: number;
  resolved: number;
  dismissed: number;
  avg_rating: number;
}

export async function getSchoolFeedback() {
  return fetchJson<{ success: boolean; feedback: SchoolFeedbackItem[]; stats: SchoolFeedbackStats }>('/api/school/feedback');
}

export async function updateSchoolFeedbackStatus(id: number, status: string) {
  return fetchJson<{ success: boolean }>(`/api/school/feedback/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}
