import { db } from '../../db/index.js';
import { hashPassword, comparePassword } from '../auth/crypto.js';
import { createNotification } from '../notifications/services.js';
import { dispatchEvent } from '../notifications/dispatch.js';

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
  await db.run('DELETE FROM school_refresh_tokens WHERE school_id = ?', schoolId);
  return { success: true };
}

export async function blockSchoolUser(
  schoolId: number,
  userId: number,
  reason = 'بدون سبب',
  days = 0,
): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null; name: string }>('SELECT school_id, name FROM users WHERE id = ?', userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };

  const blockUntil = days > 0
    ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    : null;
  await db.run(
    'UPDATE users SET blocked_at = datetime("now"), block_reason = ?, block_until = ? WHERE id = ?',
    reason,
    blockUntil,
    userId,
  );

  const school = await db.get<{ name: string }>('SELECT name FROM schools WHERE id = ?', schoolId);
  await dispatchEvent({
    type: 'user_blocked',
    actorId: schoolId,
    actorName: school?.name || 'المدرسة',
    actorRole: 'school',
    payload: { userId, schoolId, reason },
  });

  return { success: true };
}

export async function unblockSchoolUser(schoolId: number, userId: number): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null; name: string }>('SELECT school_id, name FROM users WHERE id = ?', userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };
  await db.run('UPDATE users SET blocked_at = NULL, block_reason = NULL, block_until = NULL WHERE id = ?', userId);

  const school = await db.get<{ name: string }>('SELECT name FROM schools WHERE id = ?', schoolId);
  await dispatchEvent({
    type: 'user_unblocked',
    actorId: schoolId,
    actorName: school?.name || 'المدرسة',
    actorRole: 'school',
    payload: { userId, schoolId },
  });

  return { success: true };
}

export { createEmailChangeRequest, getEmailChangeRequests, reviewEmailChangeRequest } from './services-email.js';

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
     FROM warnings w
     LEFT JOIN users a ON w.admin_id = a.id
     LEFT JOIN schools s ON w.school_id = s.id
     WHERE w.user_id = ? ORDER BY w.created_at DESC`,
    userId,
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
    `INSERT INTO warnings (school_id, user_id, title, message, severity) VALUES (?, ?, ?, ?, ?)`,
    schoolId, userId, title, message, severity,
  );

  const school = await db.get<{ name: string }>('SELECT name FROM schools WHERE id = ?', schoolId);
  await dispatchEvent({
    type: 'warning_sent',
    actorId: schoolId,
    actorName: school?.name || 'المدرسة',
    actorRole: 'school',
    payload: { studentId: userId, schoolId, message: `${title}: ${message}` },
  });

  return { success: true };
}

export async function getSchoolWarnings(schoolId: number): Promise<any[]> {
  return db.all(
    `SELECT w.*, u.name as user_name, u.email as user_email, u.role as user_role
     FROM warnings w
     JOIN users u ON w.user_id = u.id
     WHERE w.school_id = ?
     ORDER BY w.created_at DESC`,
    schoolId,
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

