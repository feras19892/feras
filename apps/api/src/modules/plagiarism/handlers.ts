import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from './services.js';
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
  const flags = await svc.getPlagiarismFlags(classId, status);
  return c.json({ success: true, flags });
});

// Update plagiarism flag status (teacher/admin)
app.patch('/:id/status', zValidator('json', z.object({ status: z.string() })), async (c) => {
  const user = c.get('user');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const id = Number(c.req.param('id'));
  const { status } = c.req.valid('json');
  const result = await svc.updatePlagiarismStatus(id, status, user.id);
  if (!result.success) return c.json(result, 400);
  return c.json(result);
});

export { app as plagiarismRoutes };
