import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from './services.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();
app.use(authMiddleware);

const detectSchema = z.object({
  class_id: z.string().min(1),
  experiment_name: z.string().min(1),
});

// Run plagiarism detection (teacher/admin)
app.post('/detect', zValidator('json', detectSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const body = c.req.valid('json');
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', body.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح — لا يمكنك فحص فصل لا تملكه' }, 403);
    }
  } else if (user.school_id) {
    // School-scoped admin — the class must belong to their school
    const classRow = await db.get<{ school_id: number | null }>(
      `SELECT COALESCE(c.school_id, t.school_id) as school_id FROM classes c LEFT JOIN users t ON c.teacher_id = t.id WHERE c.id = ?`,
      body.class_id,
    );
    if (!classRow || (classRow.school_id && classRow.school_id !== user.school_id)) {
      return c.json({ success: false, message: 'غير مصرح — الفصل خارج نطاق مدرستك' }, 403);
    }
  }
  const results = await svc.detectPlagiarism(body.class_id, body.experiment_name, user.id);
  return c.json({ success: true, results });
});

// Get plagiarism flags
app.get('/', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'school') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const classId = c.req.query('class_id');
  const status = c.req.query('status');
  if (user.role === 'teacher') {
    if (classId) {
      const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', classId);
      if (!classRow || classRow.teacher_id !== user.id) {
        return c.json({ success: false, message: 'غير مصرح' }, 403);
      }
    }
    const flags = await svc.getPlagiarismFlags(classId, status, 100, undefined, user.id);
    return c.json({ success: true, flags });
  }
  const schoolId = user.role === 'school' ? user.id : (user.school_id ?? undefined);
  const flags = await svc.getPlagiarismFlags(classId, status, 100, schoolId);
  return c.json({ success: true, flags });
});

// Update plagiarism flag status (teacher/admin)
app.patch('/flags/:id', zValidator('json', z.object({
  status: z.enum(['pending', 'reviewed', 'confirmed', 'dismissed']),
  note: z.string().max(1000).optional(),
})), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const id = Number(c.req.param('id'));
  const { status, note } = c.req.valid('json');
  const flag = await db.get<{ teacher_id: number | null; school_id: number | null }>(
    `SELECT c.teacher_id, COALESCE(c.school_id, t.school_id) as school_id
     FROM plagiarism_flags pf JOIN classes c ON pf.class_id = c.id
     LEFT JOIN users t ON c.teacher_id = t.id WHERE pf.id = ?`,
    id,
  );
  if (!flag) return c.json({ success: false, message: 'غير موجود' }, 404);
  if (user.role === 'teacher' && flag.teacher_id !== user.id) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  if (user.role === 'admin' && user.school_id && flag.school_id && flag.school_id !== user.school_id) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const result = await svc.updatePlagiarismStatus(id, status, user.id, note);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

export { app as plagiarismRoutes };
