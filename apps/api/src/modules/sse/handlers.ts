import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { authMiddleware } from '../auth/middleware.js';
import { eventBus } from './event-bus.js';
import { isAllowedOrigin } from '../../shared/middleware/cors.js';
import type { SSEEvent } from './event-bus.js';
import type { User } from '@my-modern-app/shared-types';

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();
app.use(authMiddleware);

// GET /events — SSE stream for real-time notifications
app.get('/events', (c) => {
  const user = c.get('user');

  const requestOrigin = c.req.header('origin');
  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter((s) => s !== '*' && s !== '')
    : [];
  const fallbackOrigin = envOrigins[0] ?? null;
  const origin = (requestOrigin && isAllowedOrigin(requestOrigin))
    ? requestOrigin
    : (requestOrigin ? null : fallbackOrigin);
  if (!origin) {
    return c.text('Origin not allowed', 403);
  }
  c.header('Access-Control-Allow-Origin', origin);
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Vary', 'Origin');

  c.res = streamSSE(c, async (stream) => {
    let cleanup: (() => void) | null = null;

    let seq = 0;
    const listener = async (event: SSEEvent) => {
      if (!event.targetUserId && !event.targetRole && !event.schoolId) return;
      if (event.targetUserId && event.targetUserId !== user.id) return;
      if (event.targetRole && event.targetRole !== user.role) return;
      if (event.schoolId && user.role !== 'admin') {
        const userSchoolId = user.school_id ?? (user.role === 'school' ? user.id : undefined);
        if (userSchoolId !== event.schoolId) return;
      }

      try {
        seq += 1;
        await stream.writeSSE({
          data: JSON.stringify(event),
          event: event.type,
          id: `${Date.now()}-${seq}`,
        });
      } catch {
        // Client disconnected (abort) — cleanup is handled by stream.onAbort.
      }
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
  return c.res;
});

export { app as sseRoutes };
