import { db } from '../../db/index.js';

export interface Deadline {
  id: number;
  class_id: string;
  experiment_name: string;
  experiment_id: string | null;
  due_at: string;
  created_by: number;
  created_at: string;
}

export async function setDeadline(data: {
  class_id: string;
  experiment_name: string;
  experiment_id?: string;
  due_at: string;
  created_by: number;
}): Promise<{ success: boolean; deadline?: Deadline; message?: string }> {
  // Upsert: if exists for same class+experiment, update
  const existing = await db.get<{ id: number }>(
    `SELECT id FROM experiment_deadlines WHERE class_id = ? AND experiment_name = ?`,
    data.class_id, data.experiment_name,
  );

  if (existing) {
    await db.run(
      `UPDATE experiment_deadlines SET due_at = ?, experiment_id = ? WHERE id = ?`,
      data.due_at, data.experiment_id || null, existing.id,
    );
    const deadline = await db.get<Deadline>(`SELECT * FROM experiment_deadlines WHERE id = ?`, existing.id);
    return { success: true, deadline: deadline! };
  }

  const result = await db.run(
    `INSERT INTO experiment_deadlines (class_id, experiment_name, experiment_id, due_at, created_by)
     VALUES (?, ?, ?, ?, ?)`,
    data.class_id, data.experiment_name, data.experiment_id || null, data.due_at, data.created_by,
  );
  const deadline = await db.get<Deadline>(`SELECT * FROM experiment_deadlines WHERE id = ?`, Number(result.lastID));
  return { success: true, deadline: deadline! };
}

export async function getClassDeadlines(classId: string): Promise<Deadline[]> {
  return db.all(
    `SELECT * FROM experiment_deadlines WHERE class_id = ? ORDER BY due_at ASC`,
    classId,
  );
}

export async function getStudentDeadlines(studentId: number): Promise<Deadline[]> {
  const classIds = await db.all<{ class_id: string }[]>(
    `SELECT class_id FROM class_students WHERE student_id = ?`, studentId,
  );
  if (classIds.length === 0) return [];

  const placeholders = classIds.map(() => '?').join(',');
  return db.all(
    `SELECT * FROM experiment_deadlines WHERE class_id IN (${placeholders}) AND due_at > datetime('now', '-7 days') ORDER BY due_at ASC`,
    ...classIds.map((cs) => cs.class_id),
  );
}

export async function getTeacherDeadlines(teacherId: number): Promise<(Deadline & { class_name: string })[]> {
  return db.all(
    `SELECT d.*, c.name as class_name
     FROM experiment_deadlines d
     JOIN classes c ON d.class_id = c.id
     WHERE c.teacher_id = ? AND d.due_at > datetime('now', '-7 days')
     ORDER BY d.due_at ASC`,
    teacherId,
  );
}

export async function deleteDeadline(id: number, teacherId: number): Promise<{ success: boolean; message?: string }> {
  const deadline = await db.get<{ class_id: string }>(`SELECT class_id FROM experiment_deadlines WHERE id = ?`, id);
  if (!deadline) return { success: false, message: 'الموعد غير موجود' };

  // Verify ownership
  const cls = await db.get<{ teacher_id: number }>(`SELECT teacher_id FROM classes WHERE id = ?`, deadline.class_id);
  if (!cls || cls.teacher_id !== teacherId) return { success: false, message: 'غير مصرح' };

  await db.run(`DELETE FROM experiment_deadlines WHERE id = ?`, id);
  return { success: true };
}

export async function isReportLate(classId: string, experimentName: string): Promise<{ late: boolean; deadline?: Deadline }> {
  const deadline = await db.get<Deadline>(
    `SELECT * FROM experiment_deadlines WHERE class_id = ? AND experiment_name = ?`,
    classId, experimentName,
  );
  if (!deadline) return { late: false };
  return { late: new Date() > new Date(deadline.due_at), deadline };
}
