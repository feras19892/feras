import { db } from '../../db/index.js';
import { randomInt, randomUUID } from 'crypto';
import { getSystemSetting } from '../../shared/system-settings.js';
import { createNotification } from '../notifications/services.js';
import { dispatchEvent } from '../notifications/dispatch.js';

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(randomInt(0, chars.length));
  }
  return code;
}

async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const code = generateCode();
    const existing = await db.get('SELECT 1 FROM classes WHERE code = ?', code);
    if (!existing) return code;
  }
  throw new Error('Failed to generate a unique class code');
}

export async function createClass(teacherId: number, name: string, description = '') {
  const id = 'cls-' + randomUUID();
  const code = await generateUniqueCode();
  const teacher = await db.get<{ school_id: number | null; name: string }>('SELECT school_id, name FROM users WHERE id = ?', teacherId);
  const schoolId = teacher?.school_id ?? null;
  await db.run(
    'INSERT INTO classes (id, name, code, teacher_id, school_id, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    id, name, code, teacherId, schoolId, description, 1
  );

  await dispatchEvent({
    type: 'class_created_by_teacher',
    actorId: teacherId,
    actorName: teacher?.name || 'مدرس',
    actorRole: 'teacher',
    payload: { classId: id },
  });

  return { id, name, code };
}

export async function getTeacherClasses(teacherId: number) {
  return db.all(
    `SELECT c.id, c.name, c.code, c.is_active, c.is_frozen, c.created_at,
            (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) AS student_count
     FROM classes c
     WHERE c.teacher_id = ?
     ORDER BY c.created_at DESC`,
    teacherId
  );
}

export async function getStudentClasses(studentId: number) {
  return db.all(
    `SELECT c.id, c.name, c.code, c.teacher_id, c.is_active, c.is_frozen, c.created_at,
            u.name AS teacher_name,
            (SELECT COUNT(*) FROM class_students cs2 WHERE cs2.class_id = c.id) AS student_count
     FROM classes c
     JOIN class_students cs ON c.id = cs.class_id
     LEFT JOIN users u ON c.teacher_id = u.id
     WHERE cs.student_id = ?
     ORDER BY c.is_active DESC, cs.joined_at DESC`,
    studentId
  );
}

export async function getClassById(classId: string) {
  return db.get('SELECT * FROM classes WHERE id = ?', classId);
}

export async function regenerateClassCode(classId: string) {
  const code = await generateUniqueCode();
  await db.run('UPDATE classes SET code = ? WHERE id = ?', code, classId);
  return { success: true, code };
}

export async function getClassStudents(classId: string) {
  return db.all(
    `SELECT u.id, u.name, u.email, cs.joined_at, u.blocked_at,
       (SELECT COUNT(*) FROM penalties p WHERE p.student_id = u.id AND p.class_id = ? AND p.type NOT IN ('reward')) AS penalty_count,
       (SELECT COUNT(*) FROM penalties p WHERE p.student_id = u.id AND p.class_id = ? AND p.type = 'reward') AS reward_count,
       (SELECT COUNT(*) FROM student_badges sb WHERE sb.student_id = u.id) AS badge_count,
       (SELECT COALESCE(SUM(p.points), 0) FROM penalties p WHERE p.student_id = u.id AND p.class_id = ?) AS total_points
     FROM users u
     JOIN class_students cs ON u.id = cs.student_id
     WHERE cs.class_id = ?
     ORDER BY cs.joined_at`,
    classId, classId, classId, classId
  );
}

export async function isClassMember(classId: string, studentId: number) {
  const row = await db.get(
    'SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?',
    classId, studentId
  );
  return !!row;
}

export async function joinClassByCode(studentId: number, code: string) {
  const cls = await db.get<{ id: string; name: string; code: string; teacher_id: number; is_active: number; is_frozen: number; school_id: number | null }>(
    'SELECT id, name, code, teacher_id, is_active, is_frozen, school_id FROM classes WHERE code = ? AND is_active = 1',
    code,
  );
  if (!cls) return { success: false, message: 'الكود غير صحيح أو الفصل مغلق' };

  // Check if class is frozen
  if (cls.is_frozen) return { success: false, message: 'هذا الفصل مجمد — لا يمكن الانضمام' };

  const student = await db.get<{ school_id: number | null; blocked_at: string | null }>(
    'SELECT school_id, blocked_at FROM users WHERE id = ? AND role = \'student\'',
    studentId,
  );
  if (!student) return { success: false, message: 'الطالب غير موجود' };
  if (student.blocked_at) return { success: false, message: 'الحساب محظور ولا يمكن الانضمام لفصل' };
  if (cls.school_id != null && cls.school_id !== student.school_id) {
    return { success: false, message: 'لا يمكن الانضمام — الفصل لا ينتمي لمدرستك' };
  }

  const existing = await db.get(
    'SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?',
    cls.id, studentId
  );
  if (existing) return { success: false, message: 'أنت مشترك في هذا الفصل مسبقاً' };

  // Check max class size from system settings
  const maxVal = await getSystemSetting('max_class_size');
  const maxSize = maxVal ? parseInt(maxVal, 10) : 50;
  if (maxSize > 0) {
    const countRow = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM class_students WHERE class_id = ?', cls.id);
    if (countRow && countRow.cnt >= maxSize) {
      return { success: false, message: `هذا الفصل ممتلئ (الحد الأقصى ${maxSize} طالب)` };
    }
  }

  await db.run(
    'INSERT INTO class_students (class_id, student_id) VALUES (?, ?)',
    cls.id, studentId
  );

  // Notify the teacher that a new student joined their class
  const studentName = await db.get<{ name: string }>('SELECT name FROM users WHERE id = ?', studentId);
  if (studentName?.name) {
    await createNotification({
      user_id: cls.teacher_id,
      type: 'class_joined',
      title: 'انضمام طالب جديد',
      message: `انضم الطالب ${studentName.name} إلى فصل "${cls.name}"`,
      class_id: cls.id,
    });
  }

  return { success: true, class_id: cls.id, name: cls.name, code: cls.code };
}

export async function leaveClass(classId: string, studentId: number) {
  const existing = await db.get(
    'SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?',
    classId,
    studentId,
  );
  if (!existing) {
    return { success: false, message: 'أنت لست مشتركاً في هذا الفصل' };
  }

  await db.run('DELETE FROM class_students WHERE class_id = ? AND student_id = ?', classId, studentId);
  return { success: true };
}

export async function removeStudentFromClass(classId: string, teacherId: number, studentId: number) {
  const cls = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', classId);
  if (!cls) return { success: false, message: 'الفصل غير موجود' };
  if (cls.teacher_id !== teacherId) return { success: false, message: 'غير مصرح' };

  await db.run('DELETE FROM class_students WHERE class_id = ? AND student_id = ?', classId, studentId);
  return { success: true };
}

export async function deleteClass(classId: string, teacherId: number) {
  const cls = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', classId);
  if (!cls) return { success: false, message: 'الفصل غير موجود' };
  if (cls.teacher_id !== teacherId) return { success: false, message: 'غير مصرح' };

  await db.run('BEGIN IMMEDIATE');
  try {
    const quizIds = await db.all<{ id: number }[]>('SELECT id FROM quizzes WHERE class_id = ?', classId);
    if (quizIds.length > 0) {
      const qIds = quizIds.map(q => q.id);
      const qPlaceholders = qIds.map(() => '?').join(',');
      await db.run(`DELETE FROM quiz_submissions WHERE quiz_id IN (${qPlaceholders})`, ...qIds);
      await db.run(`DELETE FROM quiz_questions WHERE quiz_id IN (${qPlaceholders})`, ...qIds);
      await db.run(`DELETE FROM quizzes WHERE id IN (${qPlaceholders})`, ...qIds);
    }
    await db.run('DELETE FROM announcements WHERE class_id = ?', classId);
    await db.run('DELETE FROM experiment_reports WHERE class_id = ?', classId);
    await db.run('DELETE FROM class_students WHERE class_id = ?', classId);
    await db.run('DELETE FROM classes WHERE id = ?', classId);
    await db.run('COMMIT');
  } catch (err) {
    await db.run('ROLLBACK');
    throw err;
  }
  return { success: true };
}

export async function getPendingReportsCount(teacherId: number) {
  return db.get(
    `SELECT COUNT(*) as count
     FROM experiment_reports r
     JOIN classes c ON r.class_id = c.id
     WHERE c.teacher_id = ? AND r.status = 'submitted'`,
    teacherId
  );
}

export async function updateClass(classId: string, teacherId: number, data: { name?: string; is_active?: boolean; is_frozen?: boolean }) {
  const cls = await db.get('SELECT teacher_id FROM classes WHERE id = ?', classId);
  if (!cls) return { success: false, message: 'الفصل غير موجود' };
  if (cls.teacher_id !== teacherId) return { success: false, message: 'غير مصرح' };

  const sets: string[] = [];
  const vals: any[] = [];
  if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); }
  if (data.is_active !== undefined) { sets.push('is_active = ?'); vals.push(data.is_active ? 1 : 0); }
  if (data.is_frozen !== undefined) { sets.push('is_frozen = ?'); vals.push(data.is_frozen ? 1 : 0); }
  if (sets.length === 0) return { success: true };

  vals.push(classId);
  await db.run(`UPDATE classes SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ...vals);
  return { success: true };
}

export async function getClassStats(classId: string) {
  const studentCount = await db.get(`SELECT COUNT(*) as count FROM class_students WHERE class_id = ?`, classId);
  const reports = await db.all(`SELECT student_id, status, grade FROM experiment_reports WHERE class_id = ?`, classId);
  const totalReports = reports.length;
  const graded = reports.filter((r: any) => r.status === 'graded');
  const classAvg = graded.length > 0
    ? Math.round(graded.reduce((s: number, r: any) => s + (r.grade || 0), 0) / graded.length)
    : 0;

  // Top students by average grade
  const studentMap: Record<number, { grades: number[]; count: number }> = {};
  for (const r of reports) {
    if (!studentMap[r.student_id]) studentMap[r.student_id] = { grades: [], count: 0 };
    if (r.grade !== null && r.grade !== undefined) studentMap[r.student_id].grades.push(r.grade);
    studentMap[r.student_id].count++;
  }
  const topStudents = Object.entries(studentMap)
    .map(([id, data]) => ({
      student_id: Number(id),
      avg: data.grades.length > 0 ? Math.round(data.grades.reduce((a, b) => a + b, 0) / data.grades.length) : 0,
      report_count: data.count,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  return {
    student_count: studentCount?.count || 0,
    total_reports: totalReports,
    graded_count: graded.length,
    pending_count: totalReports - graded.length,
    class_average: classAvg,
    top_students: topStudents,
  };
}
