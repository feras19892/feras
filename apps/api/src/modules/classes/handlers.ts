import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createClassSchema, joinClassSchema, leaveClassSchema, updateClassSchema } from './schemas.js';
import * as svc from './services.js';
import { authMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };

const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);

app.post('/', zValidator('json', createClassSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const { name } = c.req.valid('json');
  const result = await svc.createClass(user.id, name);
  return c.json({ success: true, class: result });
});

app.get('/', async (c) => {
  const user = c.get('user');
  if (user.role === 'teacher' || user.role === 'admin') {
    const list = await svc.getTeacherClasses(user.id);
    return c.json({ success: true, classes: list });
  }
  const list = await svc.getStudentClasses(user.id);
  return c.json({ success: true, classes: list });
});

app.get('/:id', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const cls = await svc.getClassById(classId);
  if (!cls) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
  if (user.role === 'student') {
    const isMember = await svc.isClassMember(classId, user.id);
    if (!isMember) return c.json({ success: false, message: 'غير مصرح' }, 403);
  } else if (cls.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const students = await svc.getClassStudents(classId);
  return c.json({ success: true, class: cls, students });
});

app.post('/join', zValidator('json', joinClassSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const { code } = c.req.valid('json');
  const result = await svc.joinClassByCode(user.id, code);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

app.post('/leave', zValidator('json', leaveClassSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const { class_id } = c.req.valid('json');
  const result = await svc.leaveClass(class_id, user.id);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

app.patch('/:id', zValidator('json', updateClassSchema), async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const data = c.req.valid('json');
  const result = await svc.updateClass(classId, user.id, data);
  if (!result.success) return c.json(result, result.message === 'غير مصرح' ? 403 : 404);
  return c.json(result);
});

app.get('/stats/pending', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const result = await svc.getPendingReportsCount(user.id);
  return c.json({ success: true, pendingCount: result?.count || 0 });
});

// GET /:id/stats — إحصائيات الفصل
app.get('/:id/stats', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const cls = await svc.getClassById(classId);
  if (!cls) return c.json({ success: false, message: 'الفصل غير موجود' }, 404);
  if (cls.teacher_id !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const stats = await svc.getClassStats(classId);
  return c.json({ success: true, stats });
});

app.delete('/:id', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const result = await svc.deleteClass(classId, user.id);
  if (!result.success) return c.json(result, result.message === 'غير مصرح' ? 403 : 404);
  return c.json(result);
});

export { app as classRoutes };
