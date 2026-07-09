import { Hono } from 'hono';
import { getStats } from './services.js';
import { authMiddleware } from '../auth/middleware.js';

const dashboardRoutes = new Hono();

dashboardRoutes.use(authMiddleware);

dashboardRoutes.get('/stats', async (c) => {
  const stats = await getStats();
  return c.json({ success: true, data: stats });
});

export { dashboardRoutes };
