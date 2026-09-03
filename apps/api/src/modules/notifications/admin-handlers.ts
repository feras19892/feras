import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

const app = new Hono<{ Variables: { user: User } }>();

const templateSchema = z.object({
  key: z.string().min(1),
  role: z.string().min(1),
  event: z.enum(['trial_ends', 'yearly_renewal', 'payment_due']),
  days_before: z.number().int().min(0),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  is_active: z.number().int().min(0).max(1).optional(),
  channel: z.enum(['in_app', 'email', 'sms']).optional(),
  ar_title: z.string().min(1),
  ar_body: z.string().min(1),
  en_title: z.string().min(1),
  en_body: z.string().min(1),
  es_title: z.string().min(1),
  es_body: z.string().min(1),
});

interface NotificationTemplate {
  id: number;
  key: string;
  role: string;
  event: string;
  days_before: number;
  hour: number;
  minute: number;
  is_active: number;
  channel: string;
  ar_title: string;
  ar_body: string;
  en_title: string;
  en_body: string;
  es_title: string;
  es_body: string;
  created_at: string;
  updated_at: string;
}

app.use(authMiddleware);

app.get('/', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const q = c.req.query();
  const conditions: string[] = [];
  const params: any[] = [];
  if (q.event) { conditions.push('event = ?'); params.push(q.event); }
  if (q.role) { conditions.push('role = ?'); params.push(q.role); }
  if (q.is_active) { conditions.push('is_active = ?'); params.push(Number(q.is_active)); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sort = q.sort === 'days_before' || q.sort === 'event' ? q.sort : 'id';
  const order = q.order === 'asc' ? 'ASC' : 'DESC';
  const rows = await db.all<NotificationTemplate[]>(
    `SELECT * FROM notification_templates ${where} ORDER BY ${sort} ${order}`,
    ...params,
  );
  return c.json({ success: true, templates: rows });
});

app.post('/', zValidator('json', templateSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const body = c.req.valid('json');
  try {
    const result = await db.run(
      `INSERT INTO notification_templates (key, role, event, days_before, hour, minute, is_active, channel, ar_title, ar_body, en_title, en_body, es_title, es_body)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      body.key, body.role, body.event, body.days_before, body.hour, body.minute, body.is_active ?? 1, body.channel ?? 'in_app',
      body.ar_title, body.ar_body, body.en_title, body.en_body, body.es_title, body.es_body,
    );
    return c.json({ success: true, id: result.lastID }, 201);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return c.json({ success: false, message: 'المفتاح مستخدم مسبقاً' }, 400);
    throw e;
  }
});

app.patch('/:id', zValidator('json', templateSchema.partial()), async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); }
  }
  if (!fields.length) return c.json({ success: false, message: 'لا توجد بيانات للتحديث' }, 400);
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  await db.run(`UPDATE notification_templates SET ${fields.join(', ')} WHERE id = ?`, ...values);
  return c.json({ success: true });
});

app.delete('/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const id = Number(c.req.param('id'));
  await db.run('DELETE FROM notification_templates WHERE id = ?', id);
  return c.json({ success: true });
});

app.post('/run', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const { runSubscriptionScheduler } = await import('./scheduler.js');
  await runSubscriptionScheduler();
  return c.json({ success: true, message: 'تم تشغيل المجدول' });
});

export { app as notificationTemplateRoutes };
