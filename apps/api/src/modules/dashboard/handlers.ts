import { Hono } from 'hono';
import { getStats } from './services.js';
import { authMiddleware } from '../auth/middleware.js';
import { getPendingNameRequests, resolveNameRequest } from '../auth/services.js';
import type { User } from '@my-modern-app/shared-types';

const dashboardRoutes = new Hono();

dashboardRoutes.use(authMiddleware);

dashboardRoutes.get('/stats', async (c) => {
  const stats = await getStats();
  return c.json({ success: true, data: stats });
});

dashboardRoutes.get('/name-requests', async (c) => {
  const user = (c as any).get('user') as User;
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }
  const requests = await getPendingNameRequests(user.id);
  return c.json({ success: true, requests });
});

dashboardRoutes.patch('/name-requests/:id', async (c) => {
  const user = (c as any).get('user') as User;
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }
  const requestId = Number(c.req.param('id'));
  const body = await c.req.json();
  const approved = body.approved === true;
  const result = await resolveNameRequest(requestId, user.id, approved);
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 400);
  }
  return c.json({ success: true });
});

export { dashboardRoutes };
