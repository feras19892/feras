import { db } from '../../db/index.js';
import { hashPassword, comparePassword, generateRefreshToken, hashRefreshToken } from '../auth/crypto.js';
import { signAccessToken } from '../auth/jwt.js';
import type { School } from '@my-modern-app/shared-types';
import { randomBytes } from 'crypto';

function generateSchoolCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SCH-';
  const bytes = randomBytes(4);
  for (let i = 0; i < 4; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

async function issueTokensForSchool(school: School): Promise<{ token: string; refreshToken: string }> {
  const token = await signAccessToken({
    sub: String(school.id),
    email: school.email,
    role: 'school',
  });

  const refreshToken = generateRefreshToken();
  const refreshHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.run(
    'INSERT INTO school_refresh_tokens (token_hash, school_id, expires_at) VALUES (?, ?, ?)',
    refreshHash,
    school.id,
    expiresAt,
  );

  return { token, refreshToken };
}

export async function registerSchool(
  name: string,
  email: string,
  password: string,
  maxStudents: number,
  maxTeachers: number,
): Promise<{ success: boolean; message?: string; school?: School; code?: string }> {
  try {
    const existing = await db.get<{ id: number }>('SELECT id FROM schools WHERE email = ?', email);
    if (existing) {
      return { success: false, message: 'Email already registered' };
    }

    const passwordHash = await hashPassword(password);
    let code = generateSchoolCode();
    // Ensure unique code
    let codeExists = await db.get<{ id: number }>('SELECT id FROM schools WHERE code = ?', code);
    while (codeExists) {
      code = generateSchoolCode();
      codeExists = await db.get<{ id: number }>('SELECT id FROM schools WHERE code = ?', code);
    }

    const result = await db.run(
      'INSERT INTO schools (email, name, password_hash, code, max_students, max_teachers, email_verified_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
      email,
      name,
      passwordHash,
      code,
      maxStudents,
      maxTeachers,
    );

    const school: School = {
      id: Number(result.lastID),
      email,
      name,
      code,
      max_students: maxStudents,
      max_teachers: maxTeachers,
      is_active: true,
      email_verified_at: new Date().toISOString(),
    };

    console.log(`[school] Registered: ${name} (${email}), code: ${code}`);

    return { success: true, school, code };
  } catch (err) {
    console.error('registerSchool error:', err);
    return { success: false, message: 'Registration failed' };
  }
}

export async function loginSchool(
  email: string,
  password: string,
): Promise<{ success: boolean; message?: string; school?: School; token?: string; refreshToken?: string }> {
  try {
    const row = await db.get<{
      id: number;
      email: string;
      name: string;
      code: string;
      password_hash: string;
      max_students: number;
      max_teachers: number;
      is_active: number;
    }>('SELECT * FROM schools WHERE email = ?', email);

    if (!row) {
      return { success: false, message: 'Invalid credentials' };
    }
    if (!row.is_active) {
      return { success: false, message: 'School account is suspended' };
    }

    const valid = await comparePassword(password, row.password_hash);
    if (!valid) {
      return { success: false, message: 'Invalid credentials' };
    }

    const school: School = {
      id: Number(row.id),
      email: row.email,
      name: row.name,
      code: row.code,
      max_students: row.max_students,
      max_teachers: row.max_teachers,
      is_active: !!row.is_active,
    };

    const { token, refreshToken } = await issueTokensForSchool(school);

    return { success: true, school, token, refreshToken };
  } catch (err) {
    console.error('loginSchool error:', err);
    return { success: false, message: 'Login failed' };
  }
}

export async function getSchoolById(id: number): Promise<School | null> {
  const row = await db.get<{
    id: number;
    email: string;
    name: string;
    code: string;
    max_students: number;
    max_teachers: number;
    is_active: number;
    created_at: string;
  }>('SELECT id, email, name, code, max_students, max_teachers, is_active, created_at FROM schools WHERE id = ?', id);

  if (!row) return null;

  return {
    id: Number(row.id),
    email: row.email,
    name: row.name,
    code: row.code,
    max_students: row.max_students,
    max_teachers: row.max_teachers,
    is_active: !!row.is_active,
    created_at: row.created_at,
  };
}

export async function getSchoolStats(schoolId: number): Promise<{
  students: number;
  teachers: number;
  classes: number;
  reports: number;
}> {
  const userCounts = await db.get<{ students: number; teachers: number }>(
    `SELECT SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
     SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as teachers
     FROM users WHERE school_id = ?`,
    schoolId,
  );

  const classCount = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM classes c JOIN users u ON c.teacher_id = u.id WHERE u.school_id = ?`,
    schoolId,
  );

  const reportCount = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE u.school_id = ?`,
    schoolId,
  );

  return {
    students: userCounts?.students || 0,
    teachers: userCounts?.teachers || 0,
    classes: classCount?.count || 0,
    reports: reportCount?.count || 0,
  };
}

export async function getSchoolUsers(schoolId: number): Promise<{ id: number; name: string; email: string; role: string; created_at: string }[]> {
  const rows = await db.all<{ id: number; name: string; email: string; role: string; created_at: string }[]>(
    'SELECT id, name, email, role, created_at FROM users WHERE school_id = ? ORDER BY created_at DESC',
    schoolId,
  );
  return rows;
}

export async function getSchoolClasses(schoolId: number): Promise<{ id: string; name: string; code: string; teacher_name: string; student_count: number; created_at: string }[]> {
  const rows = await db.all<{ id: string; name: string; code: string; teacher_name: string; student_count: number; created_at: string }[]>(
    `SELECT c.id, c.name, c.code, u.name as teacher_name,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count,
     c.created_at
     FROM classes c JOIN users u ON c.teacher_id = u.id
     WHERE u.school_id = ? ORDER BY c.created_at DESC`,
    schoolId,
  );
  return rows;
}

export async function removeSchoolUser(schoolId: number, userId: number): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null }>('SELECT school_id FROM users WHERE id = ?', userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };

  await db.run('UPDATE users SET school_id = NULL WHERE id = ?', userId);
  return { success: true };
}

export async function getAllSchools(): Promise<{ id: number; email: string; name: string; code: string; max_students: number; max_teachers: number; is_active: boolean; created_at: string; student_count: number; teacher_count: number }[]> {
  const rows = await db.all<any[]>(
    `SELECT s.id, s.email, s.name, s.code, s.max_students, s.max_teachers, s.is_active, s.created_at,
     (SELECT COUNT(*) FROM users WHERE school_id = s.id AND role = 'student') as student_count,
     (SELECT COUNT(*) FROM users WHERE school_id = s.id AND role = 'teacher') as teacher_count
     FROM schools s ORDER BY s.created_at DESC`,
  );
  return rows.map(r => ({
    id: Number(r.id),
    email: r.email,
    name: r.name,
    code: r.code,
    max_students: r.max_students,
    max_teachers: r.max_teachers,
    is_active: !!r.is_active,
    created_at: r.created_at,
    student_count: r.student_count,
    teacher_count: r.teacher_count,
  }));
}

export async function toggleSchoolActive(schoolId: number): Promise<{ success: boolean; message?: string }> {
  const school = await db.get<{ is_active: number }>('SELECT is_active FROM schools WHERE id = ?', schoolId);
  if (!school) return { success: false, message: 'School not found' };
  await db.run('UPDATE schools SET is_active = ? WHERE id = ?', school.is_active ? 0 : 1, schoolId);
  return { success: true };
}

export async function updateSchool(schoolId: number, updates: { name?: string; email?: string; max_students?: number; max_teachers?: number }): Promise<{ success: boolean; message?: string }> {
  const school = await db.get<{ id: number }>('SELECT id FROM schools WHERE id = ?', schoolId);
  if (!school) return { success: false, message: 'School not found' };

  const fields: string[] = [];
  const values: any[] = [];
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.email !== undefined) { fields.push('email = ?'); values.push(updates.email); }
  if (updates.max_students !== undefined) { fields.push('max_students = ?'); values.push(updates.max_students); }
  if (updates.max_teachers !== undefined) { fields.push('max_teachers = ?'); values.push(updates.max_teachers); }

  if (fields.length === 0) return { success: false, message: 'No fields to update' };

  values.push(schoolId);
  await db.run(`UPDATE schools SET ${fields.join(', ')} WHERE id = ?`, ...values);
  return { success: true };
}

export async function deleteSchool(schoolId: number): Promise<{ success: boolean; message?: string }> {
  const school = await db.get<{ id: number }>('SELECT id FROM schools WHERE id = ?', schoolId);
  if (!school) return { success: false, message: 'School not found' };

  // Detach all users from this school
  await db.run('UPDATE users SET school_id = NULL WHERE school_id = ?', schoolId);
  // Delete the school
  await db.run('DELETE FROM schools WHERE id = ?', schoolId);
  return { success: true };
}

export async function adminGetSchoolUsers(schoolId: number): Promise<{ id: number; name: string; email: string; role: string; created_at: string; blocked_at: string | null }[]> {
  const rows = await db.all<any[]>(
    `SELECT id, name, email, role, created_at, blocked_at FROM users WHERE school_id = ? ORDER BY created_at DESC`,
    schoolId,
  );
  return rows;
}

export async function adminGetSchoolClasses(schoolId: number): Promise<{ id: string; name: string; code: string; teacher_name: string; student_count: number; created_at: string }[]> {
  const rows = await db.all<any[]>(
    `SELECT c.id, c.name, c.code, u.name as teacher_name,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count,
     c.created_at
     FROM classes c JOIN users u ON c.teacher_id = u.id
     WHERE u.school_id = ? ORDER BY c.created_at DESC`,
    schoolId,
  );
  return rows;
}

export async function adminGetSchoolReports(schoolId: number): Promise<any[]> {
  const rows = await db.all<any[]>(
    `SELECT r.id, r.experiment_type, r.experiment_name, r.status, r.grade, r.submitted_at, r.created_at,
     u.name as student_name, c.name as class_name
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     LEFT JOIN classes c ON r.class_id = c.id
     WHERE u.school_id = ? ORDER BY r.created_at DESC`,
    schoolId,
  );
  return rows;
}

export async function adminRemoveSchoolUser(schoolId: number, userId: number): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null; role: string }>('SELECT school_id, role FROM users WHERE id = ?', userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };

  await db.run('UPDATE users SET school_id = NULL WHERE id = ?', userId);
  return { success: true };
}

export async function adminBlockSchoolUser(schoolId: number, userId: number, block: boolean): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null }>('SELECT school_id FROM users WHERE id = ?', userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };

  if (block) {
    await db.run('UPDATE users SET blocked_at = datetime("now") WHERE id = ?', userId);
  } else {
    await db.run('UPDATE users SET blocked_at = NULL WHERE id = ?', userId);
  }
  return { success: true };
}

// ─── School self-service functions ───

export async function getSchoolReports(schoolId: number): Promise<any[]> {
  const rows = await db.all<any[]>(
    `SELECT r.id, r.experiment_type, r.experiment_name, r.status, r.grade, r.submitted_at, r.created_at,
     u.name as student_name, c.name as class_name
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     LEFT JOIN classes c ON r.class_id = c.id
     WHERE u.school_id = ? ORDER BY r.created_at DESC`,
    schoolId,
  );
  return rows;
}

export async function updateSchoolName(schoolId: number, name: string): Promise<{ success: boolean; message?: string }> {
  const school = await db.get<{ id: number }>('SELECT id FROM schools WHERE id = ?', schoolId);
  if (!school) return { success: false, message: 'School not found' };
  await db.run('UPDATE schools SET name = ?, updated_at = datetime("now") WHERE id = ?', name, schoolId);
  return { success: true };
}

export async function changeSchoolPassword(schoolId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  const school = await db.get<{ password_hash: string }>('SELECT password_hash FROM schools WHERE id = ?', schoolId);
  if (!school) return { success: false, message: 'School not found' };
  const valid = await comparePassword(currentPassword, school.password_hash);
  if (!valid) return { success: false, message: 'Current password is incorrect' };
  const newHash = await hashPassword(newPassword);
  await db.run('UPDATE schools SET password_hash = ?, updated_at = datetime("now") WHERE id = ?', newHash, schoolId);
  return { success: true };
}

export async function blockSchoolUser(schoolId: number, userId: number): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null }>('SELECT school_id FROM users WHERE id = ?', userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };
  await db.run('UPDATE users SET blocked_at = datetime("now") WHERE id = ?', userId);
  return { success: true };
}

export async function unblockSchoolUser(schoolId: number, userId: number): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null }>('SELECT school_id FROM users WHERE id = ?', userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };
  await db.run('UPDATE users SET blocked_at = NULL WHERE id = ?', userId);
  return { success: true };
}

// ─── Email change requests ───

export async function createEmailChangeRequest(
  requesterType: 'user' | 'school',
  requesterId: number,
  currentEmail: string,
  requestedEmail: string,
): Promise<{ success: boolean; message?: string }> {
  const existing = await db.get<{ id: number }>(
    'SELECT id FROM email_change_requests WHERE requester_type = ? AND requester_id = ? AND status = ?',
    requesterType, requesterId, 'pending',
  );
  if (existing) return { success: false, message: 'You already have a pending request' };

  const emailTaken = await db.get<{ id: number }>(
    'SELECT id FROM users WHERE email = ? UNION SELECT id FROM schools WHERE email = ?',
    requestedEmail, requestedEmail,
  );
  if (emailTaken) return { success: false, message: 'Email already in use' };

  await db.run(
    'INSERT INTO email_change_requests (requester_type, requester_id, current_email, requested_email) VALUES (?, ?, ?, ?)',
    requesterType, requesterId, currentEmail, requestedEmail,
  );
  return { success: true };
}

// ─── School Oversight Functions ───

export async function getSchoolUserDetail(schoolId: number, userId: number) {
  const user = await db.get<any>(
    `SELECT id, name, email, role, email_verified_at, created_at, blocked_at, block_reason, school_id FROM users WHERE id = ?`,
    userId
  );
  if (!user || user.school_id !== schoolId) return null;

  const joinedClasses = await db.all(
    `SELECT c.id, c.name, c.code, c.created_at, u.name as teacher_name
     FROM class_students cs JOIN classes c ON cs.class_id = c.id
     LEFT JOIN users u ON c.teacher_id = u.id
     WHERE cs.student_id = ? ORDER BY cs.joined_at DESC`,
    userId
  );

  const taughtClasses = await db.all(
    `SELECT c.id, c.name, c.code, c.created_at,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
     FROM classes c WHERE c.teacher_id = ? ORDER BY c.created_at DESC`,
    userId
  );

  const reports = await db.all(
    `SELECT r.id, r.experiment_name, r.experiment_type, r.status, r.grade, r.feedback,
     r.submitted_at, r.graded_at, c.name as class_name
     FROM experiment_reports r LEFT JOIN classes c ON r.class_id = c.id
     WHERE r.student_id = ? ORDER BY r.submitted_at DESC`,
    userId
  );

  const activity = await db.all(
    `SELECT action, details, created_at FROM activity_log WHERE actor_id = ? ORDER BY created_at DESC LIMIT 50`,
    userId
  );

  const sessions = await db.all(
    `SELECT ip, user_agent, login_at, logout_at FROM session_log WHERE user_id = ? ORDER BY login_at DESC LIMIT 30`,
    userId
  );

  const warnings = await db.all(
    `SELECT w.id, w.title, w.message, w.severity, w.is_read, w.created_at,
     a.name as admin_name, s.name as school_name
     FROM warnings w LEFT JOIN users a ON w.admin_id = a.id
     LEFT JOIN schools s ON w.admin_id = s.id
     WHERE w.user_id = ? ORDER BY w.created_at DESC`,
    userId
  );

  const stats = {
    totalReports: reports.length,
    gradedReports: reports.filter((r: any) => r.status === 'graded').length,
    pendingReports: reports.filter((r: any) => r.status === 'submitted' || r.status === 'resubmitted').length,
    avgGrade: (() => {
      const graded = reports.filter((r: any) => r.grade != null);
      return graded.length > 0 ? Math.round(graded.reduce((s: number, r: any) => s + r.grade, 0) / graded.length) : 0;
    })(),
    totalClasses: user.role === 'teacher' ? taughtClasses.length : joinedClasses.length,
    totalSessions: sessions.length,
  };

  return { user, joinedClasses, taughtClasses, reports, activity, sessions, warnings, stats };
}

export async function getSchoolClassDetail(schoolId: number, classId: string) {
  const cls = await db.get<any>(
    `SELECT c.*, u.name as teacher_name, u.email as teacher_email
     FROM classes c JOIN users u ON c.teacher_id = u.id
     WHERE c.id = ? AND u.school_id = ?`,
    classId, schoolId
  );
  if (!cls) return null;

  const students = await db.all(
    `SELECT u.id, u.name, u.email, cs.joined_at,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.student_id = u.id AND r.class_id = c.id) as report_count
     FROM class_students cs
     JOIN users u ON cs.student_id = u.id
     JOIN classes c ON cs.class_id = c.id
     WHERE cs.class_id = ? ORDER BY cs.joined_at`,
    classId
  );

  const messages = await db.all(
    `SELECT m.id, m.user_id, m.user_name, m.user_role, m.content, m.is_flagged, m.flagged_reason, m.created_at
     FROM class_messages m WHERE m.class_id = ? ORDER BY m.created_at DESC LIMIT 200`,
    classId
  );

  const reports = await db.all(
    `SELECT r.id, r.experiment_name, r.status, r.grade, r.submitted_at,
     u.name as student_name
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     WHERE r.class_id = ? ORDER BY r.submitted_at DESC`,
    classId
  );

  const stats = {
    studentCount: students.length,
    messageCount: messages.length,
    flaggedCount: messages.filter((m: any) => m.is_flagged).length,
    reportCount: reports.length,
    gradedCount: reports.filter((r: any) => r.status === 'graded').length,
  };

  return { class: cls, students, messages, reports, stats };
}

export async function createSchoolWarning(
  schoolId: number,
  userId: number,
  title: string,
  message: string,
  severity: string,
): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null }>(
    'SELECT school_id FROM users WHERE id = ?',
    userId,
  );
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };

  await db.run(
    `INSERT INTO warnings (admin_id, user_id, title, message, severity) VALUES (?, ?, ?, ?, ?)`,
    schoolId, userId, title, message, severity,
  );

  await db.run(
    `INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)`,
    userId, 'warning', title, message,
  );

  return { success: true };
}

export async function getSchoolWarnings(schoolId: number): Promise<any[]> {
  return db.all(
    `SELECT w.*, u.name as user_name, u.email as user_email, u.role as user_role
     FROM warnings w
     JOIN users u ON w.user_id = u.id
     WHERE u.school_id = ? AND w.admin_id = ?
     ORDER BY w.created_at DESC`,
    schoolId, schoolId,
  );
}

export async function reportToAdmin(
  schoolId: number,
  userId: number,
  reason: string,
  details: string,
): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null; name: string; email: string }>(
    'SELECT school_id, name, email FROM users WHERE id = ?',
    userId,
  );
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };

  const school = await db.get<{ name: string }>('SELECT name FROM schools WHERE id = ?', schoolId);
  const schoolName = school?.name || 'Unknown';

  const admins = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE role = 'admin'`);
  for (const admin of admins) {
    await db.run(
      `INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)`,
      admin.id,
      'school_report',
      `بلاغ من المدرسة "${schoolName}" عن المستخدم "${user.name}" (${user.email})`,
      `السبب: ${reason}. التفاصيل: ${details}`,
    );
  }

  await db.run(
    `INSERT INTO activity_log (actor_id, actor_name, action, details) VALUES (?, ?, ?, ?)`,
    schoolId, schoolName, 'school_report_user',
    `Reported user ${user.name} (${user.email}): ${reason} — ${details}`,
  );

  return { success: true };
}

export async function getSchoolSessionLog(schoolId: number, limit = 100): Promise<any[]> {
  return db.all(
    `SELECT s.id, s.ip, s.user_agent, s.login_at, s.logout_at,
     u.name as user_name, u.email as user_email, u.role as user_role
     FROM session_log s
     JOIN users u ON s.user_id = u.id
     WHERE u.school_id = ?
     ORDER BY s.login_at DESC LIMIT ?`,
    schoolId, limit,
  );
}

export async function getSchoolActivityLog(schoolId: number, limit = 100): Promise<any[]> {
  return db.all(
    `SELECT a.id, a.actor_id, a.actor_name, a.action, a.details, a.created_at,
     u.email as user_email, u.role as user_role
     FROM activity_log a
     LEFT JOIN users u ON a.actor_id = u.id
     WHERE u.school_id = ?
     ORDER BY a.created_at DESC LIMIT ?`,
    schoolId, limit,
  );
}

export async function getEmailChangeRequests(): Promise<any[]> {
  return db.all<any[]>(
    'SELECT * FROM email_change_requests ORDER BY created_at DESC',
  );
}

export async function reviewEmailChangeRequest(
  requestId: number,
  status: 'approved' | 'rejected',
  reviewedBy: number,
): Promise<{ success: boolean; message?: string }> {
  const req = await db.get<any>(
    'SELECT * FROM email_change_requests WHERE id = ? AND status = ?',
    requestId, 'pending',
  );
  if (!req) return { success: false, message: 'Request not found or already reviewed' };

  await db.run(
    'UPDATE email_change_requests SET status = ?, reviewed_by = ?, reviewed_at = datetime("now") WHERE id = ?',
    status, reviewedBy, requestId,
  );

  if (status === 'approved') {
    if (req.requester_type === 'school') {
      await db.run('UPDATE schools SET email = ?, updated_at = datetime("now") WHERE id = ?', req.requested_email, req.requester_id);
    } else {
      await db.run('UPDATE users SET email = ?, updated_at = datetime("now") WHERE id = ?', req.requested_email, req.requester_id);
    }
  }

  return { success: true };
}
