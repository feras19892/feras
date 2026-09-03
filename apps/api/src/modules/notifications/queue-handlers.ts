import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';
import { createNotification, createSchoolNotification } from './services.js';
import { generateQueueForAll } from './queue.js';

const app = new Hono<{ Variables: { user: User } }>();

interface QueueRecord {
  id: number;
  user_id: number | null;
  school_id: number | null;
  owner_id: number | null;
  owner_type: string | null;
  event: string;
  event_date: string;
  scheduled_at: string;
  title: string;
  message: string;
  lang: string;
  channel: string;
  status: string;
  attempts: number;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

app.use(authMiddleware);

interface NotificationUser {
  id: number;
  name: string;
  email: string;
  role: string;
  subscription_status: string | null;
  plan_name: string | null;
  expires_at: string | null;
  pending_count: number;
  sent_count: number;
  last_title: string | null;
  last_status: string | null;
  last_scheduled: string | null;
}

app.get('/users/:id/notifications', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const id = Number(c.req.param('id'));
  const rows = await db.all<{ id: number; type: string; title: string; message: string; is_read: number; created_at: string }[]>(
    `SELECT id, type, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    id,
  );
  const queue = await db.all<{ id: number; event: string; event_date: string; scheduled_at: string; status: string; title: string; message: string; channel: string; sent_at: string | null; created_at: string }[]>(
    `SELECT id, event, event_date, scheduled_at, status, title, message, channel, sent_at, created_at
     FROM subscription_notification_queue WHERE user_id = ? ORDER BY scheduled_at DESC LIMIT 50`,
    id,
  );
  return c.json({ success: true, notifications: rows, queue });
});

app.get('/users', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const q = c.req.query();
  const wheres: string[] = ['u.role != ?'];
  const params: any[] = ['admin'];
  if (q.role) { wheres.push('u.role = ?'); params.push(q.role); }
  if (q.status) { wheres.push('COALESCE(s.status, ?) = ?'); params.push('none', q.status); }
  if (q.search) { wheres.push('(u.name LIKE ? OR u.email LIKE ?)'); const like = `%${q.search}%`; params.push(like, like); }
  const where = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
  const rows = await db.all<NotificationUser[]>(
    `SELECT
       u.id, u.name, u.email, u.role,
       s.status as subscription_status, p.name as plan_name, s.expires_at,
       (SELECT COUNT(*) FROM subscription_notification_queue q WHERE q.user_id = u.id AND q.status = 'pending') as pending_count,
       (SELECT COUNT(*) FROM subscription_notification_queue q WHERE q.user_id = u.id AND q.status = 'sent') as sent_count,
       (SELECT q.title FROM subscription_notification_queue q WHERE q.user_id = u.id ORDER BY q.scheduled_at DESC LIMIT 1) as last_title,
       (SELECT q.status FROM subscription_notification_queue q WHERE q.user_id = u.id ORDER BY q.scheduled_at DESC LIMIT 1) as last_status,
       (SELECT q.scheduled_at FROM subscription_notification_queue q WHERE q.user_id = u.id ORDER BY q.scheduled_at DESC LIMIT 1) as last_scheduled
     FROM users u
     LEFT JOIN subscriptions s ON s.owner_type = 'user' AND s.owner_id = u.id AND s.status IN ('TRIAL','ACTIVE')
     LEFT JOIN plans p ON p.id = s.plan_id
     ${where}
     ORDER BY u.id DESC
     LIMIT ? OFFSET ?`,
    ...params,
    Number(q.limit || 50),
    (Number(q.page || 1) - 1) * Number(q.limit || 50),
  );
  const totalRow = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM users u LEFT JOIN subscriptions s ON s.owner_type = 'user' AND s.owner_id = u.id AND s.status IN ('TRIAL','ACTIVE') ${where}`,
    ...params.slice(0, -2),
  );
  return c.json({ success: true, users: rows, total: totalRow?.count ?? 0 });
});

app.get('/', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const q = c.req.query();
  const conditions: string[] = [];
  const params: any[] = [];
  if (q.status) { conditions.push('status = ?'); params.push(q.status); }
  if (q.event) { conditions.push('event = ?'); params.push(q.event); }
  if (q.user_id) { conditions.push('user_id = ?'); params.push(Number(q.user_id)); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sort = ['id', 'scheduled_at', 'event', 'status'].includes(q.sort ?? '') ? q.sort : 'id';
  const order = q.order === 'asc' ? 'ASC' : 'DESC';
  const page = Math.max(1, Number(q.page || 1));
  const limit = Math.min(100, Math.max(1, Number(q.limit || 20)));
  const offset = (page - 1) * limit;
  const rows = await db.all<QueueRecord[]>(
    `SELECT * FROM subscription_notification_queue ${where} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`,
    ...params, limit, offset,
  );
  const totalRow = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM subscription_notification_queue ${where}`,
    ...params,
  );
  return c.json({ success: true, queue: rows, total: totalRow?.count ?? 0 });
});

const sendSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  scheduled_at: z.string().optional(),
  channel: z.enum(['in_app', 'email', 'sms']).default('in_app'),
});

app.post('/:id/send', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const id = Number(c.req.param('id'));
  const row = await db.get<QueueRecord>('SELECT * FROM subscription_notification_queue WHERE id = ?', id);
  if (!row) return c.json({ success: false, message: 'غير موجود' }, 404);
  try {
    if (row.user_id) await createNotification({ user_id: row.user_id, type: 'subscription', title: row.title, message: row.message });
    else if (row.school_id) await createSchoolNotification({ school_id: row.school_id, type: 'subscription', title: row.title, message: row.message });
    await db.run(
      `UPDATE subscription_notification_queue SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = ?`,
      id,
    );
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, message: 'فشل الإرسال' }, 500);
  }
});

app.patch('/:id', zValidator('json', sendSchema.partial()), async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined) { fields.push(`${k} = ?`); values.push(v); }
  }
  if (!fields.length) return c.json({ success: false, message: 'لا توجد بيانات' }, 400);
  values.push(id);
  await db.run(`UPDATE subscription_notification_queue SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ...values);
  return c.json({ success: true });
});

app.delete('/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const id = Number(c.req.param('id'));
  await db.run('DELETE FROM subscription_notification_queue WHERE id = ?', id);
  return c.json({ success: true });
});

interface NotificationOwner {
  owner_id: number;
  owner_type: 'user' | 'school';
  name: string;
  email: string;
  role: string;
  subscription_status: string | null;
  plan_name: string | null;
  expires_at: string | null;
  pending_count: number;
  sent_count: number;
  last_title: string | null;
  last_status: string | null;
  last_scheduled: string | null;
}

app.get('/owners', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const q = c.req.query();
  const search = q.search ? `%${q.search}%` : null;
  const role = q.role;
  const status = q.status;
  const limit = Math.min(100, Math.max(1, Number(q.limit || 50)));
  const page = Math.max(1, Number(q.page || 1));
  const offset = (page - 1) * limit;

  const values: unknown[] = [];
  const userWheres: string[] = ['u.role != ?'];
  const schoolWheres: string[] = [];
  values.push('admin');

  if (role) {
    if (role === 'school') { userWheres.push('1=0'); schoolWheres.push('1=1'); }
    else { userWheres.push('u.role = ?'); schoolWheres.push('1=0'); values.push(role); }
  }
  if (status) {
    userWheres.push('COALESCE(s.status, ?) = ?');
    schoolWheres.push('COALESCE(sub.status, ?) = ?');
    values.push('none', status, 'none', status);
  }
  if (search) {
    userWheres.push('(u.name LIKE ? OR u.email LIKE ?)');
    schoolWheres.push('(sch.name LIKE ? OR sch.email LIKE ?)');
    values.push(search, search, search, search);
  }

  const userWhere = userWheres.length ? `WHERE ${userWheres.join(' AND ')}` : '';
  const schoolWhere = schoolWheres.length ? `WHERE ${schoolWheres.join(' AND ')}` : '';

  const rows = await db.all<NotificationOwner[]>(
    `SELECT * FROM (
      SELECT
        u.id as owner_id,
        'user' as owner_type,
        u.name,
        u.email,
        u.role,
        s.status as subscription_status,
        p.name as plan_name,
        s.expires_at,
        (SELECT COUNT(*) FROM subscription_notification_queue q WHERE q.owner_id = u.id AND q.owner_type = 'user' AND q.status = 'pending') as pending_count,
        (SELECT COUNT(*) FROM subscription_notification_queue q WHERE q.owner_id = u.id AND q.owner_type = 'user' AND q.status = 'sent') as sent_count,
        (SELECT q.title FROM subscription_notification_queue q WHERE q.owner_id = u.id AND q.owner_type = 'user' ORDER BY q.scheduled_at DESC LIMIT 1) as last_title,
        (SELECT q.status FROM subscription_notification_queue q WHERE q.owner_id = u.id AND q.owner_type = 'user' ORDER BY q.scheduled_at DESC LIMIT 1) as last_status,
        (SELECT q.scheduled_at FROM subscription_notification_queue q WHERE q.owner_id = u.id AND q.owner_type = 'user' ORDER BY q.scheduled_at DESC LIMIT 1) as last_scheduled
      FROM users u
      LEFT JOIN subscriptions s ON s.owner_type = 'user' AND s.owner_id = u.id AND s.status IN ('TRIAL','ACTIVE')
      LEFT JOIN plans p ON p.id = s.plan_id
      ${userWhere}
      UNION ALL
      SELECT
        sch.id as owner_id,
        'school' as owner_type,
        sch.name,
        sch.email,
        'school' as role,
        sub.status as subscription_status,
        p.name as plan_name,
        sub.expires_at,
        (SELECT COUNT(*) FROM subscription_notification_queue q WHERE q.owner_id = sch.id AND q.owner_type = 'school' AND q.status = 'pending') as pending_count,
        (SELECT COUNT(*) FROM subscription_notification_queue q WHERE q.owner_id = sch.id AND q.owner_type = 'school' AND q.status = 'sent') as sent_count,
        (SELECT q.title FROM subscription_notification_queue q WHERE q.owner_id = sch.id AND q.owner_type = 'school' ORDER BY q.scheduled_at DESC LIMIT 1) as last_title,
        (SELECT q.status FROM subscription_notification_queue q WHERE q.owner_id = sch.id AND q.owner_type = 'school' ORDER BY q.scheduled_at DESC LIMIT 1) as last_status,
        (SELECT q.scheduled_at FROM subscription_notification_queue q WHERE q.owner_id = sch.id AND q.owner_type = 'school' ORDER BY q.scheduled_at DESC LIMIT 1) as last_scheduled
      FROM schools sch
      LEFT JOIN subscriptions sub ON sub.owner_type = 'school' AND sub.owner_id = sch.id AND sub.status IN ('TRIAL','ACTIVE')
      LEFT JOIN plans p ON p.id = sub.plan_id
      ${schoolWhere}
    ) AS t ORDER BY t.owner_id DESC LIMIT ? OFFSET ?`,
    ...values, limit, offset,
  );

  const totalRow = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM (
      SELECT u.id
      FROM users u
      LEFT JOIN subscriptions s ON s.owner_type = 'user' AND s.owner_id = u.id AND s.status IN ('TRIAL','ACTIVE')
      ${userWhere}
      UNION ALL
      SELECT sch.id
      FROM schools sch
      LEFT JOIN subscriptions sub ON sub.owner_type = 'school' AND sub.owner_id = sch.id AND sub.status IN ('TRIAL','ACTIVE')
      ${schoolWhere}
    ) AS t`,
    ...values,
  );

  return c.json({ success: true, owners: rows, total: totalRow?.count ?? 0 });
});

app.get('/owners/:owner_type/:owner_id/notifications', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const ownerType = c.req.param('owner_type');
  const ownerId = Number(c.req.param('owner_id'));
  if (!['user', 'school'].includes(ownerType) || !Number.isFinite(ownerId) || ownerId <= 0) {
    return c.json({ success: false, message: 'بيانات غير صالحة' }, 400);
  }

  let notifications: { id: number; type: string; title: string; message: string; is_read: number; created_at: string }[] = [];
  if (ownerType === 'user') {
    notifications = await db.all(
      'SELECT id, type, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      ownerId,
    );
  } else {
    notifications = await db.all(
      'SELECT id, type, title, message, is_read, created_at FROM school_notifications WHERE school_id = ? ORDER BY created_at DESC LIMIT 50',
      ownerId,
    );
  }

  const queue = await db.all<{ id: number; event: string; event_date: string; scheduled_at: string; status: string; title: string; message: string; channel: string; sent_at: string | null; created_at: string }[]>(
    `SELECT id, event, event_date, scheduled_at, status, title, message, channel, sent_at, created_at
     FROM subscription_notification_queue WHERE owner_id = ? AND owner_type = ? ORDER BY scheduled_at DESC LIMIT 50`,
    ownerId,
    ownerType,
  );
  return c.json({ success: true, notifications, queue });
});

export { app as notificationQueueRoutes };
