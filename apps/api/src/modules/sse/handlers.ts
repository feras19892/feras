import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { authMiddleware } from '../auth/middleware.js';
import { eventBus } from './event-bus.js';
import type { SSEEvent } from './event-bus.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();
app.use(authMiddleware);

// GET /events — SSE stream for real-time notifications
app.get('/events', (c) => {
  const user = c.get('user');

  return streamSSE(c, async (stream) => {
    let cleanup: (() => void) | null = null;

    const listener = async (event: SSEEvent) => {
      if (!event.targetUserId && !event.targetRole) return;
      if (event.targetUserId && event.targetUserId !== user.id) return;
      if (event.targetRole && event.targetRole !== user.role) return;

      await stream.writeSSE({
        data: JSON.stringify(event),
        event: event.type,
        id: `${Date.now()}`,
      });
    };

    cleanup = eventBus.onEvent(listener);

    // Send heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(async () => {
      try {
        await stream.writeSSE({ data: 'heartbeat', event: 'ping', id: `${Date.now()}` });
      } catch { /* connection closed */ }
    }, 30000);

    // Keep stream open
    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        if (cleanup) cleanup();
        clearInterval(heartbeat);
        resolve();
      });
    });
  });
});

export { app as sseRoutes };
