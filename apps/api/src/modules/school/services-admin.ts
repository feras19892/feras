import { db } from '../../db/index.js';
import { createSchoolNotification } from '../notifications/services.js';
import { dispatchEvent } from '../notifications/dispatch.js';
import { deleteUserCompletely } from '../../shared/delete-user.js';

export async function adminGetSchoolUsers(schoolId: number): Promise<{ id: number; name: string; email: string; role: string; created_at: string; blocked_at: string | null }[]> {
  const rows = await db.all<{ id: number; name: string; email: string; role: string; created_at: string; blocked_at: string | null }[]>(
    `SELECT id, name, email, role, created_at, blocked_at FROM users WHERE school_id = ? ORDER BY created_at DESC`,
    schoolId,
  );
  return rows;
}

export async function adminGetSchoolClasses(schoolId: number): Promise<{ id: string; name: string; code: string; teacher_name: string; student_count: number; created_at: string }[]> {
  const rows = await db.all<{ id: string; name: string; code: string; teacher_name: string; student_count: number; created_at: string }[]>(
    `SELECT c.id, c.name, c.code, COALESCE(u.name, '—') as teacher_name,
     (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count,
     c.created_at
     FROM classes c
     LEFT JOIN users u ON c.teacher_id = u.id
     WHERE c.school_id = ? ORDER BY c.created_at DESC`,
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
     WHERE u.school_id = ? ORDER BY r.created_at DESC LIMIT 200`,
    schoolId,
  );
  return rows;
}

export async function adminRemoveSchoolUser(schoolId: number, userId: number): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null; role: string; name: string; email: string }>('SELECT school_id, role, name, email FROM users WHERE id = ?', userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };
  await deleteUserCompletely(userId);
  await createSchoolNotification({
    school_id: schoolId,
    type: 'user_removed',
    title: 'تم حذف مستخدم من المدرسة',
    message: `تم حذف المستخدم "${user.name}" (${user.email}) من المدرسة من قبل الإدارة`,
  });
  return { success: true };
}

export async function adminBlockSchoolUser(schoolId: number, userId: number, block: boolean): Promise<{ success: boolean; message?: string }> {
  const user = await db.get<{ school_id: number | null; name: string; email: string }>('SELECT school_id, name, email FROM users WHERE id = ?', userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.school_id !== schoolId) return { success: false, message: 'User does not belong to this school' };
  if (block) {
    await db.run('UPDATE users SET blocked_at = datetime("now") WHERE id = ?', userId);
  } else {
    await db.run('UPDATE users SET blocked_at = NULL WHERE id = ?', userId);
  }
  await createSchoolNotification({
    school_id: schoolId,
    type: block ? 'user_blocked' : 'user_unblocked',
    title: block ? 'تم حظر مستخدم من المدرسة' : 'تم إلغاء حظر مستخدم',
    message: block ? `تم حظر المستخدم "${user.name}" (${user.email}) من قبل الإدارة` : `تم إلغاء حظر المستخدم "${user.name}" (${user.email}) من قبل الإدارة`,
  });
  return { success: true };
}

export async function deleteSchool(schoolId: number): Promise<{ success: boolean; message?: string }> {
  const school = await db.get<{ id: number; name: string }>('SELECT id, name FROM schools WHERE id = ?', schoolId);
  if (!school) return { success: false, message: 'School not found' };

  await dispatchEvent({
    type: 'school_deleted',
    actorId: schoolId,
    actorName: school.name,
    actorRole: 'admin',
    payload: { schoolId },
  });

  await db.run('BEGIN IMMEDIATE');
  try {
    const teacherIds = await db.all<{ id: number }[]>(
      `SELECT id FROM users WHERE school_id = ? AND role = 'teacher'`, schoolId,
    );
    if (teacherIds.length > 0) {
      const tIds = teacherIds.map(t => t.id);
      const tPlaceholders = tIds.map(() => '?').join(',');
      const classIds = await db.all<{ id: string }[]>(
        `SELECT id FROM classes WHERE teacher_id IN (${tPlaceholders})`, ...tIds,
      );
      if (classIds.length > 0) {
        const cIds = classIds.map(c => c.id);
        const cPlaceholders = cIds.map(() => '?').join(',');
        const quizIds = await db.all<{ id: number }[]>(
          `SELECT id FROM quizzes WHERE class_id IN (${cPlaceholders})`, ...cIds,
        );
        if (quizIds.length > 0) {
          const qIds = quizIds.map(q => q.id);
          const qPlaceholders = qIds.map(() => '?').join(',');
          await db.run(`DELETE FROM quiz_submissions WHERE quiz_id IN (${qPlaceholders})`, ...qIds);
          await db.run(`DELETE FROM quiz_questions WHERE quiz_id IN (${qPlaceholders})`, ...qIds);
          await db.run(`DELETE FROM quizzes WHERE id IN (${qPlaceholders})`, ...qIds);
        }
        await db.run(`DELETE FROM announcements WHERE class_id IN (${cPlaceholders})`, ...cIds);
        await db.run(`DELETE FROM experiment_reports WHERE class_id IN (${cPlaceholders})`, ...cIds);
        await db.run(`DELETE FROM class_messages WHERE class_id IN (${cPlaceholders})`, ...cIds);
        await db.run(`DELETE FROM experiment_deadlines WHERE class_id IN (${cPlaceholders})`, ...cIds);
        await db.run(`DELETE FROM class_students WHERE class_id IN (${cPlaceholders})`, ...cIds);
        await db.run(`DELETE FROM classes WHERE id IN (${cPlaceholders})`, ...cIds);
      }
    }
    await db.run(`DELETE FROM experiment_reports WHERE student_id IN (SELECT id FROM users WHERE school_id = ?)`, schoolId);
    await db.run(`DELETE FROM announcements WHERE scope = 'school' AND school_id = ?`, schoolId);
    await db.run(`DELETE FROM school_notifications WHERE school_id = ?`, schoolId);
    await db.run(`DELETE FROM approval_requests WHERE school_id = ?`, schoolId);
    await db.run('UPDATE users SET school_id = NULL WHERE school_id = ?', schoolId);
    await db.run('DELETE FROM school_refresh_tokens WHERE school_id = ?', schoolId);
    await db.run('DELETE FROM feedback WHERE school_id = ?', schoolId);
    await db.run('DELETE FROM warnings WHERE school_id = ?', schoolId);
    await db.run(`DELETE FROM email_change_requests WHERE requester_type = ? AND requester_id = ?`, 'school', schoolId);
    await db.run('DELETE FROM tenant_memberships WHERE tenant_type = ? AND tenant_id = ?', 'school', schoolId);
    await db.run('DELETE FROM invite_codes WHERE owner_type = ? AND owner_id = ?', 'school', schoolId);
    await db.run('DELETE FROM subscriptions WHERE owner_type = ? AND owner_id = ?', 'school', schoolId);
    const delSchool = await db.run('DELETE FROM schools WHERE id = ?', schoolId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[deleteSchool] deleted school id', schoolId, 'changes:', delSchool?.changes);
    }
    if (!delSchool || delSchool.changes === 0) {
      throw new Error(`DELETE FROM schools for id=${schoolId} had no effect`);
    }
    await db.run('COMMIT');
    if (process.env.NODE_ENV !== 'production') {
      console.log('[deleteSchool] committed for school id', schoolId);
    }
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
  return { success: true };
}
