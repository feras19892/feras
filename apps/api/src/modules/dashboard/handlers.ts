import { Hono } from 'hono';
import { getStats } from './services.js';

const dashboardRoutes = new Hono();

dashboardRoutes.get('/stats', async (c) => {
  const stats = await getStats();
  return c.json({ success: true, data: stats });
});

export { dashboardRoutes };
