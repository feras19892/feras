import { Hono } from 'hono';
import { getStats } from './services.js';
import { authMiddleware } from '../../shared/middleware/auth.js';

const dashboardRoutes = new Hono();

dashboardRoutes.use(authMiddleware);

dashboardRoutes.get('/stats', async (c) => {
  const stats = await getStats();
  return c.json({ success: true, data: stats });
});

export { dashboardRoutes };
