import { db } from '../../db/index.js';
import { hashPassword, comparePassword, generateRefreshToken, hashRefreshToken } from '../auth/crypto.js';
import { signAccessToken } from '../auth/jwt.js';
import type { School } from '@my-modern-app/shared-types';
import { randomBytes } from 'crypto';
import { createNotification } from '../notifications/services.js';
import { createSchoolNotification } from '../notifications/services.js';

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

    if (process.env.NODE_ENV !== 'production') console.log(`[school] Registered: ${name} (${email}), code: ${code}`);

    return { success: true, school, code };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('registerSchool error:', err);
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
    if (process.env.NODE_ENV !== 'production') console.error('loginSchool error:', err);
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

export async function getSchoolUsers(schoolId: number, page = 1, limit = 50): Promise<{ users: { id: number; name: string; email: string; role: string; created_at: string; blocked_at: string | null }[]; total: number; page: number; limit: number; totalPages: number }> {
  const offset = (page - 1) * limit;
  const rows = await db.all<{ id: number; name: string; email: string; role: string; created_at: string; blocked_at: string | null }[]>(
    'SELECT id, name, email, role, created_at, blocked_at FROM users WHERE school_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    schoolId, limit, offset,
  );
  const total = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE school_id = ?', schoolId);
  const count = total?.count || 0;
  return { users: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) };
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
  const rows = await db.all<{ id: number; name: string; email: string; role: string; created_at: string; blocked_at: string | null }[]>(
    `SELECT id, name, email, role, created_at, blocked_at FROM users WHERE school_id = ? ORDER BY created_at DESC`,
    schoolId,
  );
  return rows;
}

export async function adminGetSchoolClasses(schoolId: number): Promise<{ id: string; name: string; code: string; teacher_name: string; student_count: number; created_at: string }[]> {
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

export async function adminGetSchoolReports(schoolId: number): Promise<{ id: number; experiment_type: string; experiment_name: string; status: string; grade: number | null; submitted_at: string; created_at: string; student_name: string; class_name: string | null }[]> {
  const rows = await db.all<{ id: number; experiment_type: string; experiment_name: string; status: string; grade: number | null; submitted_at: string; created_at: string; student_name: string; class_name: string | null }[]>(
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

export async function getSchoolReports(schoolId: number, page = 1, limit = 50): Promise<{ reports: { id: number; experiment_type: string; experiment_name: string; status: string; grade: number | null; submitted_at: string; created_at: string; student_name: string; class_name: string | null }[]; total: number; page: number; limit: number; totalPages: number }> {
  const offset = (page - 1) * limit;
  const rows = await db.all<{ id: number; experiment_type: string; experiment_name: string; status: string; grade: number | null; submitted_at: string; created_at: string; student_name: string; class_name: string | null }[]>(
    `SELECT r.id, r.experiment_type, r.experiment_name, r.status, r.grade, r.submitted_at, r.created_at,
     u.name as student_name, c.name as class_name
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     LEFT JOIN classes c ON r.class_id = c.id
     WHERE u.school_id = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
    schoolId, limit, offset,
  );
  const total = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE u.school_id = ?`,
    schoolId,
  );
  const count = total?.count || 0;
  return { reports: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) };
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

  await createNotification({
    user_id: userId,
    type: 'warning',
    title,
    message,
  });

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
    await createNotification({
      user_id: admin.id,
      type: 'school_report',
      title: `بلاغ من المدرسة "${schoolName}" عن المستخدم "${user.name}" (${user.email})`,
      message: `السبب: ${reason}. التفاصيل: ${details}`,
    });
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

// ─── Teacher Performance Dashboard ───
export async function getTeacherPerformance(schoolId: number) {
  const teachers = await db.all<{
    id: number; name: string; email: string; created_at: string; blocked_at: string | null;
  }[]>(
    `SELECT id, name, email, created_at, blocked_at FROM users WHERE school_id = ? AND role = 'teacher' ORDER BY created_at DESC`,
    schoolId,
  );

  const results = [];
  for (const teacher of teachers) {
    const classes = await db.all<{ id: string; name: string }[]>(
      `SELECT id, name FROM classes WHERE teacher_id = ?`, teacher.id,
    );

    let totalReports = 0;
    let gradedReports = 0;
    let pendingReports = 0;
    let totalStudents = 0;

    for (const cls of classes) {
      const reportStats = await db.get<{ total: number; graded: number; pending: number }>(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded,
          SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending
         FROM experiment_reports WHERE class_id = ?`, cls.id,
      );
      totalReports += reportStats?.total || 0;
      gradedReports += reportStats?.graded || 0;
      pendingReports += reportStats?.pending || 0;

      const studentCount = await db.get<{ count: number }>(
        `SELECT COUNT(*) as count FROM class_students WHERE class_id = ?`, cls.id,
      );
      totalStudents += studentCount?.count || 0;
    }

    const lastGraded = await db.get<{ graded_at: string }>(
      `SELECT r.graded_at FROM experiment_reports r
       JOIN classes c ON r.class_id = c.id
       WHERE c.teacher_id = ? AND r.graded_at IS NOT NULL
       ORDER BY r.graded_at DESC LIMIT 1`, teacher.id,
    );

    const avgGradingTime = await db.get<{ avg_hours: number }>(
      `SELECT AVG((julianday(r.graded_at) - julianday(r.submitted_at)) * 24) as avg_hours
       FROM experiment_reports r
       JOIN classes c ON r.class_id = c.id
       WHERE c.teacher_id = ? AND r.graded_at IS NOT NULL`, teacher.id,
    );

    results.push({
      ...teacher,
      class_count: classes.length,
      total_students: totalStudents,
      total_reports: totalReports,
      graded_reports: gradedReports,
      pending_reports: pendingReports,
      grading_rate: totalReports > 0 ? Math.round((gradedReports / totalReports) * 100) : 0,
      last_graded_at: lastGraded?.graded_at || null,
      avg_grading_hours: avgGradingTime?.avg_hours ? Math.round(avgGradingTime.avg_hours) : null,
      is_blocked: !!teacher.blocked_at,
    });
  }

  return results;
}

// ─── Capacity Increase Request ───
export async function createCapacityRequest(data: {
  school_id: number;
  school_name: string;
  current_max_students: number;
  current_max_teachers: number;
  requested_max_students?: number;
  requested_max_teachers?: number;
  reason: string;
}) {
  const result = await db.run(
    `INSERT INTO capacity_requests (school_id, school_name, current_max_students, current_max_teachers, requested_max_students, requested_max_teachers, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.school_id, data.school_name, data.current_max_students, data.current_max_teachers,
    data.requested_max_students || null, data.requested_max_teachers || null, data.reason,
  );

  const admins = await db.all<{ id: number }[]>(`SELECT id FROM users WHERE role = 'admin'`);
  for (const admin of admins) {
    await createNotification({
      user_id: admin.id,
      type: 'capacity_request',
      title: `طلب سعة جديد من "${data.school_name}"`,
      message: `طلب زيادة السعة: طلاب ${data.requested_max_students || '—'}, مدرسين ${data.requested_max_teachers || '—'}`,
    });
  }

  return { success: true, id: Number(result.lastID) };
}

export async function getCapacityRequests(schoolId?: number, status?: string) {
  if (schoolId) {
    return db.all(
      `SELECT * FROM capacity_requests WHERE school_id = ? ${status ? 'AND status = ?' : ''} ORDER BY created_at DESC`,
      ...(status ? [schoolId, status] : [schoolId]),
    );
  }
  return db.all(
    `SELECT * FROM capacity_requests ${status ? 'WHERE status = ?' : ''} ORDER BY created_at DESC`,
    ...(status ? [status] : []),
  );
}

export async function reviewCapacityRequest(id: number, status: 'approved' | 'rejected', reviewerId: number, response?: string) {
  const req = await db.get<{ school_id: number; requested_max_students: number | null; requested_max_teachers: number | null }>(
    `SELECT * FROM capacity_requests WHERE id = ?`, id,
  );
  if (!req) return { success: false, message: 'الطلب غير موجود' };

  await db.run(
    `UPDATE capacity_requests SET status = ?, reviewed_by = ?, reviewed_at = datetime('now'), admin_response = ? WHERE id = ?`,
    status, reviewerId, response || null, id,
  );

  if (status === 'approved') {
    const updates: string[] = [];
    const vals: any[] = [];
    if (req.requested_max_students) {
      updates.push('max_students = ?');
      vals.push(req.requested_max_students);
    }
    if (req.requested_max_teachers) {
      updates.push('max_teachers = ?');
      vals.push(req.requested_max_teachers);
    }
    if (updates.length > 0) {
      vals.push(req.school_id);
      await db.run(`UPDATE schools SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`, ...vals);
    }
  }

  await createSchoolNotification({
    school_id: req.school_id,
    type: 'capacity_reviewed',
    title: status === 'approved' ? 'تمت الموافقة على طلب السعة' : 'تم رفض طلب السعة',
    message: response || (status === 'approved' ? 'تمت الموافقة على طلبك' : 'تم رفض طلبك'),
  });

  return { success: true };
}

// ─── Class Freeze ───
export async function freezeClass(schoolId: number, classId: string, reason: string, frozenBy: number) {
  const cls = await db.get<{ teacher_id: number }>(`SELECT teacher_id FROM classes WHERE id = ?`, classId);
  if (!cls) return { success: false, message: 'الفصل غير موجود' };

  const teacher = await db.get<{ school_id: number | null }>(`SELECT school_id FROM users WHERE id = ?`, cls.teacher_id);
  if (!teacher || teacher.school_id !== schoolId) {
    return { success: false, message: 'غير مصرح — الفصل لا يتبع مدرستك' };
  }

  await db.run(
    `UPDATE classes SET is_frozen = 1, frozen_reason = ?, frozen_at = datetime('now'), frozen_by = ? WHERE id = ?`,
    reason, frozenBy, classId,
  );

  await createNotification({
    user_id: cls.teacher_id,
    type: 'class_frozen',
    title: 'تم تجميد فصلك',
    message: `تم تجميد الفصل من قبل المدرسة. السبب: ${reason}`,
    class_id: classId,
  });

  const students = await db.all<{ student_id: number }[]>(
    `SELECT student_id FROM class_students WHERE class_id = ?`, classId,
  );
  for (const s of students) {
    await createNotification({
      user_id: s.student_id,
      type: 'class_frozen',
      title: 'تم تجميد الفصل',
      message: `تم تجميد فصلك من قبل المدرسة. السبب: ${reason}`,
      class_id: classId,
    });
  }

  return { success: true };
}

export async function unfreezeClass(schoolId: number, classId: string) {
  const cls = await db.get<{ teacher_id: number }>(`SELECT teacher_id FROM classes WHERE id = ?`, classId);
  if (!cls) return { success: false, message: 'الفصل غير موجود' };

  const teacher = await db.get<{ school_id: number | null }>(`SELECT school_id FROM users WHERE id = ?`, cls.teacher_id);
  if (!teacher || teacher.school_id !== schoolId) {
    return { success: false, message: 'غير مصرح' };
  }

  await db.run(
    `UPDATE classes SET is_frozen = 0, frozen_reason = NULL, frozen_at = NULL, frozen_by = NULL WHERE id = ?`,
    classId,
  );

  await createNotification({
    user_id: cls.teacher_id,
    type: 'class_unfrozen',
    title: 'تم إلغاء تجميد فصلك',
    message: 'تم إلغاء تجميد الفصل من قبل المدرسة',
    class_id: classId,
  });

  const students = await db.all<{ student_id: number }[]>(
    `SELECT student_id FROM class_students WHERE class_id = ?`, classId,
  );
  for (const s of students) {
    await createNotification({
      user_id: s.student_id,
      type: 'class_unfrozen',
      title: 'تم إلغاء تجميد الفصل',
      message: 'تم إلغاء تجميد فصلك من قبل المدرسة',
      class_id: classId,
    });
  }

  return { success: true };
}

// ─── School Detailed Reports ───

export async function getSchoolDetailedReports(schoolId: number, date?: string) {
  const targetDate = date || new Date().toISOString().slice(0, 10);

  const classes = await db.all(
    `SELECT c.id, c.name, c.code, c.teacher_id, u.name as teacher_name, c.is_frozen, c.is_active
     FROM classes c JOIN users u ON c.teacher_id = u.id
     WHERE u.school_id = ? ORDER BY c.name`,
    schoolId,
  );

  const report = [];
  for (const cls of classes) {
    const todayReports = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM experiment_reports WHERE class_id = ? AND date(submitted_at) = ?`,
      cls.id, targetDate,
    );
    const gradedToday = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM experiment_reports WHERE class_id = ? AND date(graded_at) = ?`,
      cls.id, targetDate,
    );
    const pendingReports = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM experiment_reports WHERE class_id = ? AND status = 'submitted'`,
      cls.id,
    );
    const overdueReports = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM experiment_reports WHERE class_id = ? AND status = 'submitted' AND submitted_at < datetime('now', '-3 days')`,
      cls.id,
    );
    const studentCount = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM class_students WHERE class_id = ?`, cls.id,
    );
    const activeToday = await db.get<{ count: number }>(
      `SELECT COUNT(DISTINCT student_id) as count FROM experiment_reports WHERE class_id = ? AND date(submitted_at) = ?`,
      cls.id, targetDate,
    );
    const quizSubmissionsToday = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM quiz_submissions qs JOIN quizzes q ON qs.quiz_id = q.id WHERE q.class_id = ? AND date(qs.submitted_at) = ?`,
      cls.id, targetDate,
    );
    const avgResult = await db.get<{ avg: number }>(
      `SELECT AVG(grade) as avg FROM experiment_reports WHERE class_id = ? AND grade IS NOT NULL`,
      cls.id,
    );

    const issues: string[] = [];
    if (cls.is_frozen) issues.push('الفصل مجمد');
    if (!cls.is_active) issues.push('الفصل غير نشط');
    if (overdueReports && overdueReports.count > 0) issues.push(`${overdueReports.count} تقرير متأخر (>3 أيام)`);
    if (pendingReports && pendingReports.count > 5) issues.push(`${pendingReports.count} تقرير معلق`);
    if (studentCount && studentCount.count === 0) issues.push('لا يوجد طلاب');
    if (todayReports && todayReports.count === 0 && studentCount && studentCount.count > 0) issues.push('لا يوجد نشاط اليوم');

    report.push({
      class_id: cls.id,
      class_name: cls.name,
      class_code: cls.code,
      teacher_name: cls.teacher_name,
      is_frozen: !!cls.is_frozen,
      is_active: !!cls.is_active,
      student_count: studentCount?.count || 0,
      active_today: activeToday?.count || 0,
      reports_today: todayReports?.count || 0,
      graded_today: gradedToday?.count || 0,
      pending_reports: pendingReports?.count || 0,
      overdue_reports: overdueReports?.count || 0,
      quiz_submissions_today: quizSubmissionsToday?.count || 0,
      class_average: avgResult?.avg ? Math.round(avgResult.avg) : 0,
      issues,
    });
  }

  const totalStudents = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'student'`, schoolId,
  );
  const totalTeachers = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE school_id = ? AND role = 'teacher'`, schoolId,
  );
  const totalReportsToday = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE u.school_id = ? AND date(r.submitted_at) = ?`,
    schoolId, targetDate,
  );
  const totalPending = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE u.school_id = ? AND r.status = 'submitted'`,
    schoolId,
  );
  const totalOverdue = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM experiment_reports r JOIN users u ON r.student_id = u.id WHERE u.school_id = ? AND r.status = 'submitted' AND r.submitted_at < datetime('now', '-3 days')`,
    schoolId,
  );

  return {
    date: targetDate,
    summary: {
      total_students: totalStudents?.count || 0,
      total_teachers: totalTeachers?.count || 0,
      total_classes: classes.length,
      reports_today: totalReportsToday?.count || 0,
      pending_reports: totalPending?.count || 0,
      overdue_reports: totalOverdue?.count || 0,
    },
    classes: report,
  };
}

export async function getOutstandingStudents(schoolId: number, limit = 20) {
  const students = await db.all(
    `SELECT u.id, u.name, u.email,
     COUNT(r.id) as report_count,
     AVG(r.grade) as avg_grade,
     SUM(CASE WHEN r.grade >= 90 THEN 1 ELSE 0 END) as excellent_count,
     SUM(CASE WHEN r.status = 'graded' THEN 1 ELSE 0 END) as graded_count
     FROM users u
     LEFT JOIN experiment_reports r ON u.id = r.student_id
     WHERE u.school_id = ? AND u.role = 'student'
     GROUP BY u.id
     HAVING report_count > 0
     ORDER BY avg_grade DESC, excellent_count DESC
     LIMIT ?`,
    schoolId, limit,
  );

  for (const s of students) {
    const badges = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM student_badges WHERE student_id = ?`, s.id,
    );
    s.badge_count = badges?.count || 0;
    s.avg_grade = s.avg_grade ? Math.round(s.avg_grade) : 0;
  }

  return students;
}

export async function getStrugglingStudents(schoolId: number, limit = 20) {
  const students = await db.all(
    `SELECT u.id, u.name, u.email,
     COUNT(r.id) as report_count,
     AVG(r.grade) as avg_grade,
     SUM(CASE WHEN r.status = 'submitted' THEN 1 ELSE 0 END) as pending_count,
     SUM(CASE WHEN r.grade < 50 THEN 1 ELSE 0 END) as failing_count,
     MAX(r.submitted_at) as last_activity
     FROM users u
     LEFT JOIN experiment_reports r ON u.id = r.student_id
     WHERE u.school_id = ? AND u.role = 'student'
     GROUP BY u.id
     HAVING report_count > 0
     ORDER BY avg_grade ASC, pending_count DESC
     LIMIT ?`,
    schoolId, limit,
  );

  for (const s of students) {
    s.avg_grade = s.avg_grade ? Math.round(s.avg_grade) : 0;
    s.needs_encouragement = s.avg_grade < 50 || s.pending_count > 3 || !s.last_activity;
    if (s.last_activity) {
      const daysSince = Math.floor((Date.now() - new Date(s.last_activity).getTime()) / (1000 * 60 * 60 * 24));
      s.days_inactive = daysSince;
    } else {
      s.days_inactive = null;
    }
  }

  return students;
}

export async function getTeacherEvaluation(schoolId: number) {
  const teachers = await db.all(
    `SELECT id, name, email, created_at, blocked_at FROM users WHERE school_id = ? AND role = 'teacher' ORDER BY name`,
    schoolId,
  );

  const evaluations = [];
  for (const teacher of teachers) {
    const classes = await db.all('SELECT id, name FROM classes WHERE teacher_id = ?', teacher.id);

    let totalStudents = 0;
    let totalReports = 0;
    let gradedReports = 0;
    let pendingReports = 0;
    let totalGradeSum = 0;
    let gradedWithGrade = 0;
    let quizCount = 0;
    let quizSubmissions = 0;

    for (const cls of classes) {
      const sc = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM class_students WHERE class_id = ?', cls.id);
      totalStudents += sc?.count || 0;

      const rs = await db.get<{ total: number; graded: number; pending: number; grade_sum: number; graded_with_grade: number }>(
        `SELECT COUNT(*) as total,
         SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded,
         SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'graded' AND grade IS NOT NULL THEN grade ELSE 0 END) as grade_sum,
         SUM(CASE WHEN status = 'graded' AND grade IS NOT NULL THEN 1 ELSE 0 END) as graded_with_grade
         FROM experiment_reports WHERE class_id = ?`, cls.id,
      );
      totalReports += rs?.total || 0;
      gradedReports += rs?.graded || 0;
      pendingReports += rs?.pending || 0;
      totalGradeSum += rs?.grade_sum || 0;
      gradedWithGrade += rs?.graded_with_grade || 0;

      const qc = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM quizzes WHERE class_id = ?', cls.id);
      quizCount += qc?.count || 0;

      const qs = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM quiz_submissions qs JOIN quizzes q ON qs.quiz_id = q.id WHERE q.class_id = ?', cls.id,
      );
      quizSubmissions += qs?.count || 0;
    }

    const avgGradingTime = await db.get<{ avg_hours: number }>(
      `SELECT AVG((julianday(r.graded_at) - julianday(r.submitted_at)) * 24) as avg_hours
       FROM experiment_reports r JOIN classes c ON r.class_id = c.id
       WHERE c.teacher_id = ? AND r.graded_at IS NOT NULL`, teacher.id,
    );

    const lastGraded = await db.get<{ graded_at: string }>(
      `SELECT r.graded_at FROM experiment_reports r JOIN classes c ON r.class_id = c.id
       WHERE c.teacher_id = ? AND r.graded_at IS NOT NULL ORDER BY r.graded_at DESC LIMIT 1`, teacher.id,
    );

    const lastReport = await db.get<{ submitted_at: string }>(
      `SELECT r.submitted_at FROM experiment_reports r JOIN classes c ON r.class_id = c.id
       WHERE c.teacher_id = ? ORDER BY r.submitted_at DESC LIMIT 1`, teacher.id,
    );

    let score = 0;
    if (totalReports > 0) score += Math.min(20, (gradedReports / totalReports) * 20);
    if (gradedWithGrade > 0) score += Math.min(20, (totalGradeSum / gradedWithGrade / 100) * 20);
    score += Math.min(15, classes.length * 3);
    score += Math.min(15, totalStudents * 0.5);
    score += Math.min(15, quizCount * 3);
    if (avgGradingTime?.avg_hours) {
      score += Math.max(0, 15 - Math.min(15, avgGradingTime.avg_hours / 4));
    } else {
      score += totalReports > 0 ? 0 : 7.5;
    }

    evaluations.push({
      ...teacher,
      class_count: classes.length,
      total_students: totalStudents,
      total_reports: totalReports,
      graded_reports: gradedReports,
      pending_reports: pendingReports,
      grading_rate: totalReports > 0 ? Math.round((gradedReports / totalReports) * 100) : 0,
      avg_grade: gradedWithGrade > 0 ? Math.round(totalGradeSum / gradedWithGrade) : 0,
      quiz_count: quizCount,
      quiz_submissions: quizSubmissions,
      avg_grading_hours: avgGradingTime?.avg_hours ? Math.round(avgGradingTime.avg_hours) : null,
      last_graded_at: lastGraded?.graded_at || null,
      last_report_at: lastReport?.submitted_at || null,
      teaching_score: Math.round(Math.min(100, score)),
      is_blocked: !!teacher.blocked_at,
    });
  }

  return evaluations;
}
