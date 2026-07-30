import { db } from '../../db/index.js';

export async function getAllUsers() {
  return db.all(
    `SELECT id, email, name, role, email_verified_at, created_at FROM users ORDER BY created_at DESC`
  );
}

export async function getSystemStats() {
  const users = await db.all(`SELECT role, COUNT(*) as count FROM users GROUP BY role`);
  const totalUsers = await db.get(`SELECT COUNT(*) as count FROM users`);
  const totalClasses = await db.get(`SELECT COUNT(*) as count FROM classes`);
  const totalReports = await db.get(`SELECT COUNT(*) as count FROM experiment_reports`);
  const totalGraded = await db.get(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'graded'`);
  const totalPending = await db.get(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'submitted'`);
  const totalResubmitted = await db.get(`SELECT COUNT(*) as count FROM experiment_reports WHERE status = 'resubmitted'`);
  const avgGrade = await db.get(`SELECT AVG(grade) as avg FROM experiment_reports WHERE grade IS NOT NULL`);

  return {
    users: { total: totalUsers?.count || 0, byRole: users },
    classes: { total: totalClasses?.count || 0 },
    reports: {
      total: totalReports?.count || 0,
      graded: totalGraded?.count || 0,
      pending: totalPending?.count || 0,
      resubmitted: totalResubmitted?.count || 0,
      average: Math.round(avgGrade?.avg || 0),
    },
  };
}

export async function getAllClassesWithTeachers() {
  return db.all(
    `SELECT c.*, u.name as teacher_name, u.email as teacher_email,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
     FROM classes c JOIN users u ON c.teacher_id = u.id ORDER BY c.created_at DESC`
  );
}

export async function getAllReportsWithDetails(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  return db.all(
    `SELECT r.*, u.name as student_name, u.email as student_email,
     c.name as class_name, t.name as teacher_name
     FROM experiment_reports r
     JOIN users u ON r.student_id = u.id
     JOIN classes c ON r.class_id = c.id
     JOIN users t ON c.teacher_id = t.id
     ORDER BY r.submitted_at DESC LIMIT ? OFFSET ?`,
    limit, offset
  );
}

export async function deleteUser(userId: number) {
  // Temporarily disable FK constraints to avoid ordering issues and
  // NOT NULL constraints (e.g. classes.teacher_id is NOT NULL).
  await db.run(`PRAGMA foreign_keys = OFF`);
  try {
    // Delete all rows that reference this user (both CASCADE and non-CASCADE)
    await db.run(`DELETE FROM experiment_reports WHERE student_id = ?`, userId);
    await db.run(`DELETE FROM experiment_reports WHERE admin_graded_by = ?`, userId);
    await db.run(`DELETE FROM class_students WHERE student_id = ?`, userId);
    await db.run(`DELETE FROM class_chat_reads WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM class_messages WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM chat_spam_tracker WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM report_comments WHERE author_id = ?`, userId);
    await db.run(`DELETE FROM grade_history WHERE teacher_id = ?`, userId);
    await db.run(`DELETE FROM admin_notes WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM admin_notes WHERE admin_id = ?`, userId);
    await db.run(`DELETE FROM warnings WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM warnings WHERE admin_id = ?`, userId);
    await db.run(`DELETE FROM notifications WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM feedback WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM activity_log WHERE actor_id = ?`, userId);
    await db.run(`DELETE FROM audit_log WHERE actor_id = ?`, userId);
    await db.run(`DELETE FROM session_log WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM email_verification_codes WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM email_change_requests WHERE reviewed_by = ?`, userId);
    await db.run(`DELETE FROM name_change_requests WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM name_change_requests WHERE teacher_id = ?`, userId);
    await db.run(`DELETE FROM refresh_tokens WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM math_progress WHERE user_id = ?`, userId);
    await db.run(`DELETE FROM approval_requests WHERE target_user_id = ?`, userId);
    await db.run(`DELETE FROM approval_requests WHERE requester_id = ?`, userId);
    // Tables with NOT NULL user columns (no FK but should clean up)
    await db.run(`DELETE FROM announcements WHERE author_id = ?`, userId);
    await db.run(`DELETE FROM experiment_deadlines WHERE created_by = ?`, userId);
    await db.run(`DELETE FROM plagiarism_flags WHERE detected_by = ?`, userId);
    // classes.teacher_id is NOT NULL — can't set to NULL, must delete the classes
    // First delete dependent rows for those classes
    const classIds = await db.all(`SELECT id FROM classes WHERE teacher_id = ?`, userId);
    if (classIds.length > 0) {
      const ids = classIds.map(c => c.id);
      const placeholders = ids.map(() => '?').join(',');
      await db.run(`DELETE FROM experiment_deadlines WHERE class_id IN (${placeholders})`, ...ids);
      await db.run(`DELETE FROM plagiarism_flags WHERE class_id IN (${placeholders})`, ...ids);
      await db.run(`DELETE FROM announcements WHERE class_id IN (${placeholders})`, ...ids);
      await db.run(`DELETE FROM approval_requests WHERE class_id IN (${placeholders})`, ...ids);
      await db.run(`DELETE FROM chat_spam_tracker WHERE class_id IN (${placeholders})`, ...ids);
      await db.run(`DELETE FROM class_chat_reads WHERE class_id IN (${placeholders})`, ...ids);
      await db.run(`DELETE FROM class_messages WHERE class_id IN (${placeholders})`, ...ids);
      await db.run(`DELETE FROM class_students WHERE class_id IN (${placeholders})`, ...ids);
      await db.run(`DELETE FROM experiment_reports WHERE class_id IN (${placeholders})`, ...ids);
      await db.run(`DELETE FROM classes WHERE id IN (${placeholders})`, ...ids);
    }
    // Set nullable FK references to NULL
    await db.run(`UPDATE system_settings SET updated_by = NULL WHERE updated_by = ?`, userId);
    // Finally delete the user
    await db.run(`DELETE FROM users WHERE id = ?`, userId);
  } finally {
    await db.run(`PRAGMA foreign_keys = ON`);
  }
  return { success: true };
}

export async function updateUserRole(userId: number, role: string) {
  await db.run(`UPDATE users SET role = ? WHERE id = ?`, role, userId);
  return { success: true };
}

export async function createUser(name: string, email: string, passwordHash: string, role: string) {
  const result = await db.run(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    name, email, passwordHash, role
  );
  return { success: true, id: result.lastID };
}

export async function deleteClass(classId: string) {
  await db.run(`DELETE FROM experiment_reports WHERE class_id = ?`, classId);
  await db.run(`DELETE FROM class_students WHERE class_id = ?`, classId);
  await db.run(`DELETE FROM classes WHERE id = ?`, classId);
  return { success: true };
}

export async function getClassStudentsForAdmin(classId: string) {
  return db.all(
    `SELECT u.id, u.name, u.email, cs.joined_at,
     (SELECT COUNT(*) FROM experiment_reports r WHERE r.student_id = u.id AND r.class_id = ?) as report_count
     FROM users u
     JOIN class_students cs ON u.id = cs.student_id
     WHERE cs.class_id = ?
     ORDER BY cs.joined_at`,
    classId, classId
  );
}

export async function updateClassForAdmin(classId: string, data: { name?: string; teacher_id?: number }) {
  const cls = await db.get(`SELECT * FROM classes WHERE id = ?`, classId);
  if (!cls) return { success: false, message: 'الفصل غير موجود' };

  const sets: string[] = [];
  const vals: any[] = [];
  if (data.name !== undefined && data.name.trim()) { sets.push('name = ?'); vals.push(data.name.trim()); }
  if (data.teacher_id !== undefined) {
    const teacher = await db.get(`SELECT id FROM users WHERE id = ? AND role = 'teacher'`, data.teacher_id);
    if (!teacher) return { success: false, message: 'المدرس غير موجود' };
    sets.push('teacher_id = ?');
    vals.push(data.teacher_id);
  }
  if (sets.length === 0) return { success: true };

  vals.push(classId);
  await db.run(`UPDATE classes SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ...vals);
  return { success: true };
}

export async function updateReportGradeForAdmin(reportId: number, grade: number, feedback?: string) {
  const report = await db.get(`SELECT id FROM experiment_reports WHERE id = ?`, reportId);
  if (!report) return { success: false, message: 'التقرير غير موجود' };
  if (grade < 0 || grade > 100) return { success: false, message: 'الدرجة يجب أن تكون بين 0 و 100' };

  await db.run(
    `UPDATE experiment_reports SET grade = ?, status = 'graded', graded_at = datetime('now'), feedback = ? WHERE id = ?`,
    grade, feedback || null, reportId
  );
  return { success: true };
}

export async function getAllTeachers() {
  return db.all(
    `SELECT id, name, email FROM users WHERE role = 'teacher' ORDER BY name`
  );
}

export async function getSystemSettings() {
  const rows = await db.all(`SELECT key, value FROM system_settings`);
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function updateSystemSetting(key: string, value: string, updatedBy: number) {
  await db.run(
    `INSERT INTO system_settings (key, value, updated_by, updated_at) VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = datetime('now')`,
    key, value, updatedBy
  );
  return { success: true };
}

export async function updateUserForAdmin(userId: number, data: { name?: string; email?: string }) {
  const user = await db.get(`SELECT id FROM users WHERE id = ?`, userId);
  if (!user) return { success: false, message: 'المستخدم غير موجود' };

  const sets: string[] = [];
  const vals: (string | number)[] = [];
  if (data.name !== undefined && data.name.trim()) { sets.push('name = ?'); vals.push(data.name.trim()); }
  if (data.email !== undefined && data.email.trim()) {
    const existing = await db.get(`SELECT id FROM users WHERE email = ? AND id != ?`, data.email.trim(), userId);
    if (existing) return { success: false, message: 'البريد مستخدم بالفعل' };
    sets.push('email = ?'); vals.push(data.email.trim());
  }
  if (sets.length === 0) return { success: true };

  vals.push(userId);
  await db.run(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, ...vals);
  return { success: true };
}

export async function createClassForAdmin(name: string, code: string | undefined, teacherId: number) {
  const teacher = await db.get(`SELECT id FROM users WHERE id = ? AND role = 'teacher'`, teacherId);
  if (!teacher) return { success: false, message: 'المدرس غير موجود' };

  const classCode = code || Math.random().toString(36).substring(2, 8).toUpperCase();
  const result = await db.run(
    `INSERT INTO classes (id, name, code, teacher_id) VALUES (?, ?, ?, ?)`,
    `cls_${Date.now()}`, name, classCode, teacherId
  );
  return { success: true, id: result.lastID, code: classCode };
}

export async function deleteReportForAdmin(reportId: number) {
  const report = await db.get(`SELECT id FROM experiment_reports WHERE id = ?`, reportId);
  if (!report) return { success: false, message: 'التقرير غير موجود' };
  await db.run(`DELETE FROM experiment_reports WHERE id = ?`, reportId);
  return { success: true };
}

// ─── System Alerts ───
export async function getSystemAlerts(unresolvedOnly = false) {
  if (unresolvedOnly) {
    return db.all(`SELECT * FROM system_alerts WHERE is_resolved = 0 ORDER BY created_at DESC`);
  }
  return db.all(`SELECT * FROM system_alerts ORDER BY is_resolved ASC, created_at DESC LIMIT 200`);
}

export async function resolveSystemAlert(id: number, resolvedBy: number) {
  const alert = await db.get(`SELECT id FROM system_alerts WHERE id = ?`, id);
  if (!alert) return { success: false, message: 'التنبيه غير موجود' };
  await db.run(
    `UPDATE system_alerts SET is_resolved = 1, resolved_by = ?, resolved_at = datetime('now') WHERE id = ?`,
    resolvedBy, id,
  );
  return { success: true };
}

// ─── Emergency: Freeze/Unfreeze All Classes ───
export async function freezeAllClasses(adminId: number) {
  await db.run(
    `UPDATE classes SET is_frozen = 1, frozen_reason = 'تجمد طارئ من الأدمن', frozen_at = datetime('now'), frozen_by = ? WHERE is_frozen = 0`,
    adminId,
  );
  return { success: true };
}

export async function unfreezeAllClasses() {
  await db.run(
    `UPDATE classes SET is_frozen = 0, frozen_reason = NULL, frozen_at = NULL, frozen_by = NULL WHERE is_frozen = 1`,
  );
  return { success: true };
}
