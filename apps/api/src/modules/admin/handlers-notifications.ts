import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import * as svc from './services-notifications.js';
import type { User } from '@my-modern-app/shared-types';

const targetTypes = ['all', 'role', 'school', 'class', 'user'] as const;
const priorities = ['low', 'normal', 'immediate'] as const;

type Variables = { user: User };
const app = new Hono<{ Variables: Variables }>();

app.use(authMiddleware);
app.use(async (c, next) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح — يقتصر على الأدمن' }, 403);
  }
  await next();
});

const sendSchema = z.object({
  target_type: z.enum(targetTypes),
  target_value: z.string().max(100).optional(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  priority: z.enum(priorities).optional().default('normal'),
});

// POST /api/admin/notifications
app.post('/', zValidator('json', sendSchema), async (c) => {
  const user = c.get('user') as User;
  const body = c.req.valid('json');

  // Validate target_value presence where required
  const needsValue = ['role', 'school', 'class', 'user'].includes(body.target_type);
  if (needsValue && !body.target_value) {
    return c.json({ success: false, message: 'المستهدف مطلوب' }, 400);
  }

  try {
    const result = await svc.sendAdminNotification({
      admin_id: user.id,
      target_type: body.target_type,
      target_value: body.target_value,
      title: body.title,
      message: body.message,
      priority: body.priority,
    });

    if (!result.success) {
      return c.json(result, 400);
    }
    return c.json(result, 201);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin send notification error:', err);
    return c.json({ success: false, message: 'فشل إرسال الإشعار' }, 500);
  }
});

// GET /api/admin/notifications
app.get('/', async (c) => {
  const user = c.get('user') as User;
  const page = Number(c.req.query('page') || 1);
  const limit = Math.min(Number(c.req.query('limit') || 20), 100);

  try {
    const { logs, total } = await svc.getAdminNotificationLogs(user.id, page, limit);
    return c.json({ success: true, logs, total, page, limit });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin get notifications error:', err);
    return c.json({ success: false, message: 'فشل تحميل السجل' }, 500);
  }
});

// GET /api/admin/notifications/:id/stats
app.get('/:id/stats', async (c) => {
  const logId = Number(c.req.param('id'));
  if (Number.isNaN(logId)) return c.json({ success: false, message: 'معرف غير صالح' }, 400);

  try {
    const stats = await svc.getAdminNotificationStats(logId);
    return c.json({ success: true, stats });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin notification stats error:', err);
    return c.json({ success: false, message: 'فشل تحميل الإحصائيات' }, 500);
  }
});

// DELETE /api/admin/notifications/:id
app.delete('/:id', async (c) => {
  const user = c.get('user') as User;
  const logId = Number(c.req.param('id'));
  if (Number.isNaN(logId)) return c.json({ success: false, message: 'معرف غير صالح' }, 400);

  try {
    const result = await svc.deleteAdminNotificationLog(user.id, logId);
    if (!result.success) return c.json(result, 403);
    return c.json(result);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('admin delete notification error:', err);
    return c.json({ success: false, message: 'فشل الحذف' }, 500);
  }
});

export { app as adminNotificationRoutes };
