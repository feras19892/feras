import { Hono } from 'hono';
import * as svc from './services.js';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function verifySchoolOwnsClass(schoolId: number, classId: string): Promise<boolean> {
  const row = await db.get<{ school_id: number | null }>(
    'SELECT u.school_id FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?',
    classId,
  );
  return !!row && row.school_id === schoolId;
}

// GET /:id/comments — قائمة تعليقات
app.get('/:id/comments', async (c) => {
  const user = c.get('user');
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
  const report = await svc.getReportById(id);
  if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
  if (user.role === 'student' && report.student_id !== user.id) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }
  if (user.role === 'school') {
    const owns = await verifySchoolOwnsClass(user.id, report.class_id);
    if (!owns) return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const list = await svc.getComments(id);
  return c.json({ success: true, comments: list });
});

// GET /:id/history — سجل تصحيح
app.get('/:id/history', async (c) => {
  const user = c.get('user');
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'معرف غير صالح' }, 400);
  const report = await svc.getReportById(id);
  if (!report) return c.json({ success: false, message: 'التقرير غير موجود' }, 404);
  if (user.role === 'student') {
    if (report.student_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  } else if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', report.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  } else if (user.role === 'school') {
    const owns = await verifySchoolOwnsClass(user.id, report.class_id);
    if (!owns) return c.json({ success: false, message: 'غير مصرح' }, 403);
  } else if (user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const list = await svc.getGradeHistory(id);
  return c.json({ success: true, history: list });
});

export { app as reportExtraRoutes };
