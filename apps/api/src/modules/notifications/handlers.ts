import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from './services.js';
import { addSSEClient } from './sse.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();
app.use(authMiddleware);

app.get('/stream', (c) => {
  const user = c.get('user');
  return streamSSE(c, async (stream) => {
    let aborted = false;
    const cleanup = addSSEClient(user.id, stream.aborted as unknown as ReadableStreamDefaultController);

    // Send initial heartbeat
    await stream.writeSSE({ event: 'connected', data: JSON.stringify({ userId: user.id }) });

    // Heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(async () => {
      if (aborted) return;
      try {
        await stream.writeSSE({ event: 'ping', data: String(Date.now()) });
      } catch {
        aborted = true;
      }
    }, 30000);

    // Wait for abort
    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        aborted = true;
        cleanup();
        clearInterval(heartbeat);
        resolve();
      });
    });
  });
});

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
