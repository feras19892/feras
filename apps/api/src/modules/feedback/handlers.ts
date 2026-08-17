import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from '../admin/feedback-service.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();

// POST /api/feedback — any authenticated user can submit
app.use(authMiddleware);

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'content', 'other']),
  message: z.string().min(1).max(5000),
  experimentId: z.string().optional(),
  experimentName: z.string().max(200).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

app.post('/', zValidator('json', feedbackSchema), async (c) => {
  const user = c.get('user');
  const { type, message, experimentId, experimentName, rating } = c.req.valid('json');

  // Auto-fill school_id from the user's school
  let schoolId: number | null = null;
  if (user.role === 'student' || user.role === 'teacher') {
    const userRow = await db.get<{ school_id: number | null }>(
      'SELECT school_id FROM users WHERE id = ?', user.id,
    );
    schoolId = userRow?.school_id || null;
  } else if (user.role === 'school') {
    schoolId = user.id;
  }

  await svc.createFeedback(
    user.id,
    user.name,
    type,
    message,
    experimentId,
    experimentName,
    rating,
    schoolId,
  );

  return c.json({ success: true }, 201);
});

export { app as feedbackRoutes };
