import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { authMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';

const app = new Hono<{ Variables: { user: User } }>();

const controlSchema = z.object({
  type: z.enum(['maintenance', 'renewal', 'outage', 'reminder']),
  target_role: z.enum(['all', 'student', 'teacher', 'school']),
  scope: z.enum(['individual', 'group']),
  duration_days: z.number().int().min(0),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  message: z.string().max(1000).nullable().optional(),
  is_active: z.number().int().min(0).max(1).optional(),
});

const listQuerySchema = z.object({
  type: z.enum(['maintenance', 'renewal', 'outage', 'reminder']).optional(),
  target_role: z.enum(['all', 'student', 'teacher', 'school']).optional(),
  scope: z.enum(['individual', 'group']).optional(),
  is_active: z.enum(['0', '1']).optional(),
  sort: z.enum(['created_at', 'start_date', 'end_date', 'duration_days']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

app.use(authMiddleware);

app.get('/', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const q = c.req.query();
  const safe = listQuerySchema.parse({
    type: q.type,
    target_role: q.target_role,
    scope: q.scope,
    is_active: q.is_active,
    sort: q.sort || 'created_at',
    order: q.order || 'desc',
  });
  const { type, target_role, scope, is_active, sort, order } = safe;

  const conditions: string[] = [];
  const params: any[] = [];
  if (type) { conditions.push('type = ?'); params.push(type); }
  if (target_role) { conditions.push('target_role = ?'); params.push(target_role); }
  if (scope) { conditions.push('scope = ?'); params.push(scope); }
  if (is_active != null) { conditions.push('is_active = ?'); params.push(Number(is_active)); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = `${sort} ${order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`;
  const rows = await db.all<ControlRecord[]>(
    `SELECT * FROM subscription_controls ${where} ORDER BY ${orderBy}`,
    ...params,
  );
  return c.json({ success: true, controls: rows });
});

app.post('/', zValidator('json', controlSchema), async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const body = c.req.valid('json');
  const result = await db.run(
    `INSERT INTO subscription_controls (type, target_role, scope, duration_days, start_date, end_date, message, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    body.type,
    body.target_role,
    body.scope,
    body.duration_days,
    body.start_date || null,
    body.end_date || null,
    body.message || null,
    body.is_active ?? 1,
  );
  const id = result.lastID;
  return c.json({ success: true, id }, 201);
});

app.patch('/:id', zValidator('json', controlSchema.partial()), async (c) => {
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
  await db.run(`UPDATE subscription_controls SET ${fields.join(', ')} WHERE id = ?`, ...values);
  return c.json({ success: true });
});

app.delete('/:id', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const id = Number(c.req.param('id'));
  await db.run('DELETE FROM subscription_controls WHERE id = ?', id);
  return c.json({ success: true });
});

app.post('/:id/apply', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const id = Number(c.req.param('id'));
  const row = await db.get<ControlRecord>('SELECT * FROM subscription_controls WHERE id = ?', id);
  if (!row) return c.json({ success: false, message: 'غير موجود' }, 404);
  if (!row.is_active || row.duration_days <= 0) {
    return c.json({ success: false, message: 'التحكم غير نشط أو غير صالح' }, 400);
  }

  const extSeconds = row.duration_days * 24 * 60 * 60;

  if (row.target_role === 'all' || row.target_role === 'student' || row.target_role === 'teacher') {
    const roleParam = row.target_role === 'all' ? undefined : row.target_role;
    await db.run(
      `UPDATE subscriptions
       SET expires_at = datetime(COALESCE(expires_at, CURRENT_TIMESTAMP), '+${extSeconds} seconds'),
           updated_at = CURRENT_TIMESTAMP
       WHERE owner_type = 'user'
         AND status IN ('ACTIVE', 'TRIAL')
         AND owner_id IN (SELECT id FROM users WHERE 1 ${roleParam ? 'AND role = ?' : ''})`,
      ...(roleParam ? [roleParam] : []),
    );
  }

  if (row.target_role === 'all' || row.target_role === 'school') {
    await db.run(
      `UPDATE subscriptions
       SET expires_at = datetime(COALESCE(expires_at, CURRENT_TIMESTAMP), '+${extSeconds} seconds'),
           updated_at = CURRENT_TIMESTAMP
       WHERE owner_type = 'school'
         AND status IN ('ACTIVE', 'TRIAL')`,
    );
  }

  return c.json({ success: true, message: `تم تمديد الاشتراكات ${row.duration_days} يوماً` });
});

type ControlRecord = {
  id: number;
  type: string;
  target_role: string;
  scope: string;
  duration_days: number;
  start_date: string | null;
  end_date: string | null;
  message: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export { app as subscriptionControlRoutes };
