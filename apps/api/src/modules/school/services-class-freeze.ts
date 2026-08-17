import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';

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
