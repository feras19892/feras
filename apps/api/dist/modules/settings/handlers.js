import { Hono } from 'hono';
import { authMiddleware } from '../auth/middleware.js';
const settingsRoutes = new Hono();
settingsRoutes.use(authMiddleware);
settingsRoutes.get('/', (c) => {
    return c.json({ success: true, data: { theme: 'light', language: 'ar', notifications: true } });
});
export { settingsRoutes };
