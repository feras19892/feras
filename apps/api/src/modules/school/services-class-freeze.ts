import { db } from '../../db/index.js';
import { dispatchEvent } from '../notifications/dispatch.js';
import { broadcastEvent } from '../sse/event-bus.js';

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

  const school = await db.get<{ name: string }>(`SELECT name FROM schools WHERE id = ?`, schoolId);
  await dispatchEvent({
    type: 'class_frozen',
    actorId: schoolId,
    actorName: school?.name || 'المدرسة',
    actorRole: 'school',
    payload: { classId, reason },
  });

  // تحديث حي: أبلغ معلم الفصل وطلابه فوراً عبر SSE
  broadcastEvent({ type: 'class_frozen', payload: { class_id: classId, reason }, targetUserId: cls.teacher_id });
  const students = await db.all<{ student_id: number }[]>('SELECT student_id FROM class_students WHERE class_id = ?', classId);
  for (const s of students) {
    broadcastEvent({ type: 'class_frozen', payload: { class_id: classId }, targetUserId: s.student_id });
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

  const school = await db.get<{ name: string }>(`SELECT name FROM schools WHERE id = ?`, schoolId);
  await dispatchEvent({
    type: 'class_unfrozen',
    actorId: schoolId,
    actorName: school?.name || 'المدرسة',
    actorRole: 'school',
    payload: { classId },
  });

  // تحديث حي: أبلغ معلم الفصل وطلابه فوراً عبر SSE
  broadcastEvent({ type: 'class_unfrozen', payload: { class_id: classId }, targetUserId: cls.teacher_id });
  const students = await db.all<{ student_id: number }[]>('SELECT student_id FROM class_students WHERE class_id = ?', classId);
  for (const s of students) {
    broadcastEvent({ type: 'class_unfrozen', payload: { class_id: classId }, targetUserId: s.student_id });
  }

  return { success: true };
}
