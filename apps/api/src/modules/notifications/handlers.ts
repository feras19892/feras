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
    const fakeController = {
      enqueue: (chunk: Uint8Array) => {
        const text = new TextDecoder().decode(chunk);
        let eventName = 'message';
        let dataStr = '';
        for (const line of text.trim().split('\n')) {
          if (line.startsWith('event: ')) eventName = line.slice(7);
          else if (line.startsWith('data: ')) dataStr = dataStr ? dataStr + '\n' + line.slice(6) : line.slice(6);
        }
        stream.writeSSE({ event: eventName, data: dataStr });
      },
      close: () => {},
      error: () => {},
      desiredSize: null,
    } as unknown as ReadableStreamDefaultController;
    const cleanup = addSSEClient(user.id, fakeController);

    // Send initial heartbeat
    await stream.writeSSE({ event: 'connected', data: JSON.stringify({ userId: user.id }) });

    // Heartbeat every 30s to keep connection alive
    let heartbeatErrors = 0;
    const heartbeat = setInterval(async () => {
      if (aborted) return;
      try {
        await stream.writeSSE({ event: 'ping', data: String(Date.now()) });
        heartbeatErrors = 0;
      } catch {
        heartbeatErrors++;
        if (heartbeatErrors >= 3) {
          aborted = true;
          cleanup();
          clearInterval(heartbeat);
        }
      }
    }, 30000);

    // Wait for abort or max lifetime
    await new Promise<void>((resolve) => {
      // Auto-disconnect after 10 minutes to prevent socket exhaustion
      const maxLifetime = setTimeout(() => {
        if (aborted) return;
        aborted = true;
        cleanup();
        clearInterval(heartbeat);
        stream.writeSSE({ event: 'reconnect', data: '{} ' }).catch(() => {});
        resolve();
      }, 10 * 60 * 1000);

      stream.onAbort(() => {
        aborted = true;
        cleanup();
        clearInterval(heartbeat);
        clearTimeout(maxLifetime);
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

app.patch('/:id/pin', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const result = await svc.togglePinNotification(id, user.id);
  return c.json(result);
});

export { app as notificationRoutes };
