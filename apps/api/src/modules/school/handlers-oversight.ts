import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../db/index.js';
import {
  getEmailChangeRequests, reviewEmailChangeRequest,
  getSchoolUserDetail, getSchoolClassDetail, createSchoolWarning,
  getSchoolWarnings, reportToAdmin, getSchoolSessionLog, getSchoolActivityLog,
  getTeacherPerformance, createCapacityRequest, getCapacityRequests,
  reviewCapacityRequest, freezeClass, unfreezeClass,
} from './services.js';
import { schoolAuthMiddleware, adminAuthMiddleware } from '../auth/middleware.js';
import { streamSSE } from 'hono/streaming';
import { addSchoolSSEClient } from '../notifications/sse.js';
import * as notifSvc from '../notifications/services.js';
import { schoolReportRoutes } from './handlers-reports.js';
import type { School } from '@my-modern-app/shared-types';
import type { User } from '@my-modern-app/shared-types';

type Vars = { school: School; user: User };
const schoolRoutes = new Hono<{ Variables: Vars }>();

function validId(idStr: string): number | null {
  const n = Number(idStr);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const schoolAuth = schoolAuthMiddleware;
const adminAuth = adminAuthMiddleware;

const reviewRequestSchema = z.object({ status: z.enum(['approved', 'rejected']) });

// ─── Admin: Email Change Requests ───
schoolRoutes.get('/admin/email-requests', adminAuth, async (c) => {
  const requests = await getEmailChangeRequests();
  return c.json({ success: true, requests });
});

schoolRoutes.patch('/admin/email-requests/:id', adminAuth, zValidator('json', reviewRequestSchema), async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid ID' }, 400);
  const { status } = c.req.valid('json');
  const admin = c.get('user') as User;
  const result = await reviewEmailChangeRequest(id, status, admin?.id);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── School Oversight: User Detail ───
schoolRoutes.get('/users/:userId/detail', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const userId = validId(c.req.param('userId'));
  if (!userId) return c.json({ success: false, message: 'Invalid user ID' }, 400);
  const detail = await getSchoolUserDetail(school.id, userId);
  if (!detail) return c.json({ success: false, message: 'المستخدم غير موجود في هذه المدرسة' }, 404);
  return c.json({ success: true, ...detail });
});

// ─── School Oversight: Class Detail ───
schoolRoutes.get('/classes/:classId/detail', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const classId = c.req.param('classId');
  const detail = await getSchoolClassDetail(school.id, classId);
  if (!detail) return c.json({ success: false, message: 'الفصل غير موجود في هذه المدرسة' }, 404);
  return c.json({ success: true, ...detail });
});

// ─── School Oversight: Warnings ───
const warningSchema = z.object({
  userId: z.number().int(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  severity: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
});

schoolRoutes.post('/warnings', schoolAuth, zValidator('json', warningSchema), async (c) => {
  const school = c.get('school') as School;
  const { userId, title, message, severity } = c.req.valid('json');
  const result = await createSchoolWarning(school.id, userId, title, message, severity);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

schoolRoutes.get('/warnings', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const warnings = await getSchoolWarnings(school.id);
  return c.json({ success: true, warnings });
});

// ─── School Oversight: Report to Admin ───
const reportSchema = z.object({
  userId: z.number().int(),
  reason: z.string().min(1).max(200),
  details: z.string().min(1).max(2000),
});

schoolRoutes.post('/report-to-admin', schoolAuth, zValidator('json', reportSchema), async (c) => {
  const school = c.get('school') as School;
  const { userId, reason, details } = c.req.valid('json');
  const result = await reportToAdmin(school.id, userId, reason, details);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── School Oversight: Session Log ───
schoolRoutes.get('/sessions', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const sessions = await getSchoolSessionLog(school.id);
  return c.json({ success: true, sessions });
});

// ─── School Oversight: Activity Log ───
schoolRoutes.get('/activity', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const activity = await getSchoolActivityLog(school.id);
  return c.json({ success: true, activity });
});

// ─── School: Teacher Performance ───
schoolRoutes.get('/teachers/performance', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const performance = await getTeacherPerformance(school.id);
  return c.json({ success: true, performance });
});

// ─── School: Capacity Requests ───
const capacitySchema = z.object({
  requested_max_students: z.number().int().positive().optional(),
  requested_max_teachers: z.number().int().positive().optional(),
  reason: z.string().min(1).max(500),
});

schoolRoutes.post('/capacity-request', schoolAuth, zValidator('json', capacitySchema), async (c) => {
  const school = c.get('school') as School;
  const body = c.req.valid('json');
  const result = await createCapacityRequest({
    school_id: school.id,
    school_name: school.name,
    current_max_students: school.max_students,
    current_max_teachers: school.max_teachers,
    requested_max_students: body.requested_max_students,
    requested_max_teachers: body.requested_max_teachers,
    reason: body.reason,
  });
  return c.json(result, 201);
});

schoolRoutes.get('/capacity-requests', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const status = c.req.query('status');
  const requests = await getCapacityRequests(school.id, status);
  return c.json({ success: true, requests });
});

// ─── Admin: Review Capacity Requests ───
schoolRoutes.get('/admin/capacity-requests', adminAuth, async (c) => {
  const status = c.req.query('status');
  const requests = await getCapacityRequests(undefined, status);
  return c.json({ success: true, requests });
});

schoolRoutes.patch('/admin/capacity-requests/:id', adminAuth, zValidator('json', z.object({
  status: z.enum(['approved', 'rejected']),
  response: z.string().optional(),
})), async (c) => {
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid ID' }, 400);
  const body = c.req.valid('json');
  const admin = c.get('user') as User;
  const result = await reviewCapacityRequest(id, body.status, admin?.id || 0, body.response);
  if (!result.success) return c.json({ success: false, message: result.message }, 400);
  return c.json({ success: true });
});

// ─── School: Class Freeze ───
const freezeSchema = z.object({
  class_id: z.string().min(1),
  reason: z.string().min(1).max(500),
});

schoolRoutes.post('/freeze-class', schoolAuth, zValidator('json', freezeSchema), async (c) => {
  const school = c.get('school') as School;
  const { class_id, reason } = c.req.valid('json');
  try {
    const result = await freezeClass(school.id, class_id, reason, school.id);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('freeze-class error:', err);
    return c.json({ success: false, message: 'فشل تجميد الفصل' }, 500);
  }
});

schoolRoutes.post('/unfreeze-class', schoolAuth, zValidator('json', z.object({ class_id: z.string().min(1) })), async (c) => {
  const school = c.get('school') as School;
  const { class_id } = c.req.valid('json');
  try {
    const result = await unfreezeClass(school.id, class_id);
    if (!result.success) return c.json({ success: false, message: result.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('unfreeze-class error:', err);
    return c.json({ success: false, message: 'فشل إلغاء تجميد الفصل' }, 500);
  }
});

// ─── School Notifications ───
schoolRoutes.get('/notifications/stream', schoolAuth, (c) => {
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

schoolRoutes.get('/notifications', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const list = await notifSvc.getSchoolNotifications(school.id);
  return c.json({ success: true, notifications: list });
});

schoolRoutes.get('/notifications/unread-count', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const count = await notifSvc.getSchoolUnreadCount(school.id);
  return c.json({ success: true, count });
});

schoolRoutes.patch('/notifications/:id/read', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid ID' }, 400);
  await notifSvc.markSchoolNotificationAsRead(id, school.id);
  return c.json({ success: true });
});

schoolRoutes.patch('/notifications/read-all', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  await notifSvc.markAllSchoolNotificationsAsRead(school.id);
  return c.json({ success: true });
});

schoolRoutes.delete('/notifications/:id', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid ID' }, 400);
  await notifSvc.deleteSchoolNotification(id, school.id);
  return c.json({ success: true });
});

schoolRoutes.patch('/notifications/:id/pin', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const id = validId(c.req.param('id'));
  if (!id) return c.json({ success: false, message: 'Invalid ID' }, 400);
  const result = await notifSvc.togglePinSchoolNotification(id, school.id);
  return c.json(result);
});

// ─── School Export ───
import { exportSchoolUsers, exportSchoolClasses, exportSchoolReports, exportSchoolActivity } from './export-service.js';

schoolRoutes.get('/export/:type', schoolAuth, async (c) => {
  const school = c.get('school') as School;
  const type = c.req.param('type');
  let csv = '';
  let filename = 'export.csv';
  try {
    switch (type) {
      case 'users': csv = await exportSchoolUsers(school.id); filename = 'school_users.csv'; break;
      case 'classes': csv = await exportSchoolClasses(school.id); filename = 'school_classes.csv'; break;
      case 'reports': csv = await exportSchoolReports(school.id); filename = 'school_reports.csv'; break;
      case 'activity': csv = await exportSchoolActivity(school.id); filename = 'school_activity.csv'; break;
      default: return c.json({ success: false, message: 'Invalid export type' }, 400);
    }
    c.header('Content-Type', 'text/csv; charset=utf-8');
    c.header('Content-Disposition', `attachment; filename="${filename}"`);
    return c.body(csv);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('school export error:', err);
    return c.json({ success: false, message: 'Failed to export data' }, 500);
  }
});

// ─── Merge sub-routers ───
schoolRoutes.route('/', schoolReportRoutes);

export { schoolRoutes as schoolOversightRoutes };
