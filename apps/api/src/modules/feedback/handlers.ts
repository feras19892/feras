import { Hono } from 'hono';
import { authMiddleware } from '../../shared/middleware/auth.js';
import * as svc from '../admin/feedback-service.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();

// POST /api/feedback — any authenticated user can submit
app.use(authMiddleware);

app.post('/', async (c) => {
  const user = c.get('user');
  const { type, message, experimentId, experimentName, rating } = await c.req.json();

  await svc.createFeedback(
    user.id,
    user.name,
    type,
    message,
    experimentId,
    experimentName,
    rating
  );

  return c.json({ success: true }, 201);
});

export { app as feedbackRoutes };
