import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  getSchoolClassDetail, reassignTeacher, updateClass,
  addStudentToClass, removeStudentFromClass, getClassActivityLog,
} from './services.js';
import { schoolAuthMiddleware } from '../auth/middleware.js';
import type { School } from '@my-modern-app/shared-types';

type Vars = { school: School };
const classRoutes = new Hono<{ Variables: Vars }>();

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const schoolAuth = schoolAuthMiddleware;

classRoutes.get('/:classId/detail', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const classId = c.req.param('classId');
  const detail = await getSchoolClassDetail(school.id, classId);
  if (!detail) return c.json({ success: false, message: 'الفصل غير موجود في هذه المدرسة' }, 404);
  return c.json({ success: true, ...detail });
});

classRoutes.patch('/:classId/teacher', schoolAuth, zValidator('json', z.object({ teacher_id: z.number().int().positive().optional() })), async (c) => {
  const school = c.get('school') as School;
  const classId = c.req.param('classId');
  const { teacher_id } = c.req.valid('json');
  try {
    const result = await reassignTeacher(school.id, classId, teacher_id ?? null);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('reassign-teacher error:', err);
    return c.json({ success: false, message: 'فشل تغيير مدرس الفصل' }, 500);
  }
});

classRoutes.patch('/:classId', schoolAuth, zValidator('json', z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
})), async (c) => {
  const school = c.get('school') as School;
  const classId = c.req.param('classId');
  const { name, description } = c.req.valid('json');
  try {
    const result = await updateClass(school.id, classId, name, description);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('update-class error:', err);
    return c.json({ success: false, message: 'فشل تعديل الفصل' }, 500);
  }
});

classRoutes.post('/:classId/students', schoolAuth, zValidator('json', z.object({
  student_id: z.number().int().positive(),
})), async (c) => {
  const school = c.get('school') as School;
  const classId = c.req.param('classId');
  const { student_id } = c.req.valid('json');
  try {
    const result = await addStudentToClass(school.id, classId, student_id);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('add-student-to-class error:', err);
    return c.json({ success: false, message: 'فشل إضافة الطالب' }, 500);
  }
});

classRoutes.delete('/:classId/students/:studentId', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const classId = c.req.param('classId');
  const studentId = validId(c.req.param('studentId'));
  if (!studentId) return c.json({ success: false, message: 'معرف طالب غير صالح' }, 400);
  try {
    const result = await removeStudentFromClass(school.id, classId, studentId);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('remove-student-from-class error:', err);
    return c.json({ success: false, message: 'فشل إزالة الطالب' }, 500);
  }
});

classRoutes.get('/:classId/activity', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const classId = c.req.param('classId');
  try {
    const logs = await getClassActivityLog(school.id, classId);
    return c.json({ success: true, logs });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('class-activity error:', err);
    return c.json({ success: false, message: 'فشل تحميل سجل نشاط الفصل' }, 500);
  }
});

export { classRoutes };
