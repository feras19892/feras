import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { addSchoolSSEClient } from '../notifications/sse.js';
import * as notifSvc from '../notifications/services.js';
import { schoolAuthMiddleware } from '../auth/middleware.js';
import type { School } from '@my-modern-app/shared-types';

type Vars = { school: School };
const notifRoutes = new Hono<{ Variables: Vars }>();

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const schoolAuth = schoolAuthMiddleware;

notifRoutes.get('/stream', schoolAuth, (c) => {
  const school = c.get('school') as School;
  return streamSSE(c, async (stream) => {
    let aborted = false;

    const sseAdapter = {
      enqueue: (chunk: Uint8Array) => {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        let evt = 'message';
        let data = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) evt = line.slice(7).trim();
          else if (line.startsWith('data: ')) data += line.slice(6);
        }
        return stream.writeSSE({ event: evt, data });
      },
      close: () => {},
      error: () => {},
      desiredSize: null,
    } as unknown as ReadableStreamDefaultController;
    const cleanup = addSchoolSSEClient(school.id, sseAdapter);

    await stream.writeSSE({ event: 'connected', data: JSON.stringify({ schoolId: school.id }) });

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

    await new Promise<void>((resolve) => {
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

notifRoutes.get('/', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const list = await notifSvc.getSchoolNotifications(school.id);
  return c.json({ success: true, notifications: list });
});

notifRoutes.get('/unread-count', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const count = await notifSvc.getSchoolUnreadCount(school.id);
  return c.json({ success: true, count });
});

notifRoutes.patch('/:id/read', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid ID' }, 400);
  await notifSvc.markSchoolNotificationAsRead(id, school.id);
  return c.json({ success: true });
});

notifRoutes.patch('/read-all', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  await notifSvc.markAllSchoolNotificationsAsRead(school.id);
  return c.json({ success: true });
});

notifRoutes.delete('/:id', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid ID' }, 400);
  await notifSvc.deleteSchoolNotification(id, school.id);
  return c.json({ success: true });
});

notifRoutes.patch('/:id/pin', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid ID' }, 400);
  const result = await notifSvc.togglePinSchoolNotification(id, school.id);
  return c.json(result);
});

export { notifRoutes };
