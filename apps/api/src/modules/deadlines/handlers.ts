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

const setDeadlineSchema = z.object({
  class_id: z.string().min(1),
  experiment_name: z.string().min(1),
  experiment_id: z.string().optional(),
  due_at: z.string().min(1),
});

// Set/update deadline (teacher only)
app.post('/', zValidator('json', setDeadlineSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const body = c.req.valid('json');
  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', body.class_id);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح — لا يمكنك إنشاء موعد لفصل لا تملكه' }, 403);
    }
  }
  try {
    const result = await svc.setDeadline({
      class_id: body.class_id,
      experiment_name: body.experiment_name,
      experiment_id: body.experiment_id,
      due_at: body.due_at,
      created_by: user.id,
    });
    return c.json(result, 201);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('setDeadline error:', err);
    return c.json({ success: false, message: 'Failed to set deadline' }, 500);
  }
});

// Get deadlines for a class
app.get('/class/:classId', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('classId');

  if (user.role === 'teacher') {
    const classRow = await db.get<{ teacher_id: number }>('SELECT teacher_id FROM classes WHERE id = ?', classId);
    if (!classRow || classRow.teacher_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  } else if (user.role === 'student') {
    const member = await db.get('SELECT 1 FROM class_students WHERE class_id = ? AND student_id = ?', classId, user.id);
    if (!member) return c.json({ success: false, message: 'غير مصرح' }, 403);
  } else if (user.role === 'school') {
    const cls = await db.get<{ school_id: number | null }>(
      'SELECT u.school_id FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?', classId,
    );
    if (!cls || cls.school_id !== user.id) {
      return c.json({ success: false, message: 'غير مصرح' }, 403);
    }
  }

  try {
    const list = await svc.getClassDeadlines(classId);
    return c.json({ success: true, deadlines: list });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getClassDeadlines error:', err);
    return c.json({ success: false, message: 'Failed to load deadlines' }, 500);
  }
});

// Get deadlines for current teacher (all their classes)
app.get('/teacher', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  try {
    const list = await svc.getTeacherDeadlines(user.id);
    return c.json({ success: true, deadlines: list });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getTeacherDeadlines error:', err);
    return c.json({ success: false, message: 'Failed to load deadlines' }, 500);
  }
});

// Get deadlines for current student
app.get('/student', async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  try {
    const list = await svc.getStudentDeadlines(user.id);
    return c.json({ success: true, deadlines: list });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getStudentDeadlines error:', err);
    return c.json({ success: false, message: 'Failed to load deadlines' }, 500);
  }
});

// Delete deadline
app.delete('/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const id = Number(c.req.param('id'));
  try {
    const result = await svc.deleteDeadline(id, user.id);
    if (!result.success) return c.json(result, result.message === 'غير مصرح' ? 403 : 404);
    return c.json(result);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('deleteDeadline error:', err);
    return c.json({ success: false, message: 'Failed to delete deadline' }, 500);
  }
});

export { app as deadlineRoutes };
