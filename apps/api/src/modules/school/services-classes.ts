import { db } from '../../db/index.js';

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

export async function reassignTeacher(schoolId: number, classId: string, teacherId: number | null) {
  const cls = await db.get<{ school_id: number | null; teacher_id: number | null }>(`SELECT school_id, teacher_id FROM classes WHERE id = ?`, classId);
  if (!cls) return { success: false, message: 'الفصل غير موجود' };
  if (cls.school_id !== schoolId) return { success: false, message: 'الفصل لا يتبع هذه المدرسة' };
  if (teacherId) {
    const teacher = await db.get<{ school_id: number | null }>(`SELECT school_id FROM users WHERE id = ? AND role = 'teacher'`, teacherId);
    if (!teacher || teacher.school_id !== schoolId) return { success: false, message: 'المدرس غير موجود أو لا ينتمي للمدرسة' };
  }
  await db.run(
    `UPDATE classes SET teacher_id = ?, is_active = ?, updated_at = datetime('now') WHERE id = ?`,
    teacherId ?? null, teacherId ? 1 : 0, classId,
  );
  return { success: true };
}

export async function getClassActivityLog(schoolId: number, classId: string): Promise<any[]> {
  const cls = await db.get<{ school_id: number | null }>(`SELECT school_id FROM classes WHERE id = ?`, classId);
  if (!cls || cls.school_id !== schoolId) return [];
  return db.all(
    `SELECT a.id, a.actor_id, a.actor_name, a.action, a.details, a.created_at,
     u.email as user_email, u.role as user_role
     FROM activity_log a
     LEFT JOIN users u ON a.actor_id = u.id
     WHERE a.target_type = 'class' AND a.target_id = ?
     ORDER BY a.created_at DESC LIMIT ?`,
    classId, 100,
  );
}

export async function updateClass(schoolId: number, classId: string, name: string, description?: string) {
  const cls = await db.get<{ school_id: number | null }>(`SELECT school_id FROM classes WHERE id = ?`, classId);
  if (!cls) return { success: false, message: 'الفصل غير موجود' };
  if (cls.school_id !== schoolId) return { success: false, message: 'الفصل لا يتبع هذه المدرسة' };
  await db.run(
    `UPDATE classes SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?`,
    name, description || null, classId,
  );
  return { success: true };
}

export async function addStudentToClass(schoolId: number, classId: string, studentId: number) {
  const cls = await db.get<{ school_id: number | null }>(`SELECT school_id FROM classes WHERE id = ?`, classId);
  if (!cls || cls.school_id !== schoolId) return { success: false, message: 'الفصل غير موجود أو لا يتبع المدرسة' };
  const student = await db.get<{ school_id: number | null; role: string }>(`SELECT school_id, role FROM users WHERE id = ?`, studentId);
  if (!student || student.school_id !== schoolId || student.role !== 'student') return { success: false, message: 'الطالب غير موجود أو لا ينتمي للمدرسة' };
  const existing = await db.get(`SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?`, classId, studentId);
  if (existing) return { success: false, message: 'الطالب مسجل في الفصل مسبقاً' };
  await db.run(`INSERT INTO class_students (class_id, student_id, joined_at) VALUES (?, ?, datetime('now'))`, classId, studentId);
  return { success: true };
}

export async function removeStudentFromClass(schoolId: number, classId: string, studentId: number) {
  const cls = await db.get<{ school_id: number | null }>(`SELECT school_id FROM classes WHERE id = ?`, classId);
  if (!cls || cls.school_id !== schoolId) return { success: false, message: 'الفصل غير موجود أو لا يتبع المدرسة' };
  await db.run(`DELETE FROM class_students WHERE class_id = ? AND student_id = ?`, classId, studentId);
  return { success: true };
}
