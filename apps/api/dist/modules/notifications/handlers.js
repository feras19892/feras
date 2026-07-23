import { Hono } from 'hono';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from './services.js';
const app = new Hono();
app.use(authMiddleware);
app.get('/', async (c) => {
    const user = c.get('user');
    const list = await svc.getUserNotifications(user.id);
    return c.json({ success: true, notifications: list });
});
app.get('/unread-count', async (c) => {
    const user = c.get('user');
    const count = await svc.getUnreadCount(user.id);
    return c.json({ success: true, count });
});
app.patch('/:id/read', async (c) => {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    await svc.markAsRead(id, user.id);
    return c.json({ success: true });
});
app.patch('/read-all', async (c) => {
    const user = c.get('user');
    await svc.markAllAsRead(user.id);
    return c.json({ success: true });
});
app.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    await svc.deleteNotification(id, user.id);
    return c.json({ success: true });
});
export { app as notificationRoutes };
