import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from './services.js';
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
  const result = await svc.setDeadline({
    class_id: body.class_id,
    experiment_name: body.experiment_name,
    experiment_id: body.experiment_id,
    due_at: body.due_at,
    created_by: user.id,
  });
  return c.json(result, 201);
});

// Get deadlines for a class
app.get('/class/:classId', async (c) => {
  const classId = c.req.param('classId');
  const list = await svc.getClassDeadlines(classId);
  return c.json({ success: true, deadlines: list });
});

// Get deadlines for current student
app.get('/student', async (c) => {
  const user = c.get('user');
  if (user.role !== 'student') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const list = await svc.getStudentDeadlines(user.id);
  return c.json({ success: true, deadlines: list });
});

// Delete deadline
app.delete('/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const id = Number(c.req.param('id'));
  const result = await svc.deleteDeadline(id, user.id);
  if (!result.success) return c.json(result, result.message === 'غير مصرح' ? 403 : 404);
  return c.json(result);
});

export { app as deadlineRoutes };
