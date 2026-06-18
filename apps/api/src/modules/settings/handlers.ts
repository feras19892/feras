import { Hono } from 'hono';

const settingsRoutes = new Hono();

settingsRoutes.get('/', (c) => {
  return c.json({ success: true, data: { theme: 'light', language: 'ar', notifications: true } });
});

export { settingsRoutes };
