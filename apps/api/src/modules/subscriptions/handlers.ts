import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../auth/middleware.js';
import type { User } from '@my-modern-app/shared-types';
import * as svc from './services.js';
import { db } from '../../db/index.js';
import type { SubscriptionWithPlan } from './types.js';
import { dispatchEvent } from '../notifications/dispatch.js';

const app = new Hono<{ Variables: { user: User } }>();

const createSchema = z.object({
  owner_id: z.number().int().positive(),
  owner_type: z.enum(['user', 'school']),
  plan_id: z.number().int().positive().nullable().optional(),
  status: z.enum(['ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED', 'PENDING', 'SUSPENDED']).optional(),
  starts_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  next_billing_at: z.string().datetime().nullable().optional(),
  payment_provider: z.string().max(100).nullable().optional(),
  payment_reference: z.string().max(255).nullable().optional(),
  max_students: z.number().int().min(0).nullable().optional(),
  max_teachers: z.number().int().min(0).nullable().optional(),
});

const updateSchema = z.object({
  status: z.enum(['ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED', 'PENDING', 'SUSPENDED']).optional(),
  plan_id: z.number().int().positive().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  last_payment_at: z.string().datetime().nullable().optional(),
  next_billing_at: z.string().datetime().nullable().optional(),
  cancelled_at: z.string().datetime().nullable().optional(),
  payment_provider: z.string().max(100).nullable().optional(),
  payment_reference: z.string().max(255).nullable().optional(),
  max_students: z.number().int().min(0).nullable().optional(),
  max_teachers: z.number().int().min(0).nullable().optional(),
});

// Public: list available plans (no auth required — shown on landing page)
app.get('/plans', async (c) => {
  const type = c.req.query('type') as 'student' | 'teacher' | 'school' | undefined;
  const plans = await svc.getPlans(type);
  return c.json({ success: true, plans });
});

// Auth required for all other endpoints
app.use(authMiddleware);

// Get current user/school's active subscription (covers school/teacher membership)
app.get('/me', async (c) => {
  const user = c.get('user');
  const ownerId = user.id;
  const ownerType = user.role === 'school' ? 'school' : 'user';
  const candidates: SubscriptionWithPlan[] = [];
  const own = await svc.getActiveSubscription(ownerId, ownerType);
  if (own) candidates.push(own);
  if (ownerType === 'user') {
    if (user.school_id) {
      const schoolSub = await svc.getActiveSubscription(user.school_id, 'school');
      if (schoolSub) candidates.push(schoolSub);
    }
    if (user.role === 'teacher') {
      const membership = await db.get<{ tenant_id: number }>(
        `SELECT tenant_id FROM tenant_memberships
         WHERE member_id = ? AND tenant_type = 'teacher' AND status = 'active'
         ORDER BY joined_at DESC LIMIT 1`,
        user.id,
      );
      if (membership) {
        const teacherSub = await svc.getActiveSubscription(membership.tenant_id, 'user');
        if (teacherSub) candidates.push(teacherSub);
      }
    }
  }
  const active = candidates.find((s) => s.status === 'ACTIVE');
  const sub = active ?? candidates[0];
  return c.json({ success: true, subscription: sub || null });
});

// Create subscription (admin/school/teacher only)
app.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');
  const allowed = user.role === 'admin' ||
    (user.role === 'school' && body.owner_type === 'school' && body.owner_id === user.id) ||
    (user.role === 'teacher' && body.owner_type === 'user' && body.owner_id === user.id) ||
    (user.role === 'student' && body.owner_type === 'user' && body.owner_id === user.id);
  if (!allowed) {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  if (body.plan_id != null) {
    const plan = await svc.getPlanById(body.plan_id);
    if (!plan) {
      return c.json({ success: false, message: 'الخطة غير موجودة' }, 400);
    }
    const expectedType = user.role === 'school' ? 'school' : user.role;
    if (plan.type !== expectedType) {
      return c.json({ success: false, message: 'الخطة غير مناسبة لنوع الحساب' }, 400);
    }
  }
  const id = await svc.createSubscription(body);
  const sub = await svc.getSubscriptionById(id);
  if (sub) {
    dispatchEvent({
      type: 'subscription_created',
      actorId: user.id,
      actorName: user.name || 'الأدمن',
      actorRole: user.role === 'admin' ? 'admin' : 'school',
      payload: { userId: sub.owner_type === 'user' ? sub.owner_id : undefined, schoolId: sub.owner_type === 'school' ? sub.owner_id : undefined, message: `اشتراك جديد: ${sub.plan_name || 'بدون خطة'}` },
    }).catch(() => {});
  }
  return c.json({ success: true, id }, 201);
});

// Admin: list all subscriptions
app.get('/admin/subscriptions', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'غير مصرح' }, 403);
  const q = c.req.query();
  const status = q.status as string | undefined;
  const ownerType = q.owner_type as 'user' | 'school' | undefined;
  const search = q.search as string | undefined;
  const sort = (q.sort as 'created_at' | 'expires_at' | 'price_cents') || 'created_at';
  const order = (q.order as 'asc' | 'desc') || 'desc';
  const page = Math.max(1, Number(q.page || 1));
  const limit = Math.min(200, Math.max(1, Number(q.limit || 20)));
  const subs = await svc.getAdminSubscriptions({ status, ownerType, search, sort, order, page, limit });
  return c.json({ success: true, subscriptions: subs });
});

// Update subscription
app.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const body = c.req.valid('json');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'غير مصرح' }, 403);
  }
  const sub = await svc.updateSubscription(id, body);
  if (sub) {
    dispatchEvent({
      type: 'subscription_updated',
      actorId: user.id,
      actorName: user.name || 'الأدمن',
      actorRole: 'admin',
      payload: { userId: sub.owner_type === 'user' ? sub.owner_id : undefined, schoolId: sub.owner_type === 'school' ? sub.owner_id : undefined, message: `تم تحديث اشتراكك: ${sub.status}${sub.plan_name ? ` - ${sub.plan_name}` : ''}` },
    }).catch(() => {});
  }
  return c.json({ success: true });
});

// Cancel subscription (own or admin)
app.post('/:id/cancel', async (c) => {
  const user = c.get('user');
  const id = Number(c.req.param('id'));
  const sub = await svc.getAllSubscriptions().then((rows) => rows.find((r) => r.id === id));
  if (!sub) return c.json({ success: false, message: 'غير موجود' }, 404);
  const ownerType = user.role === 'school' ? 'school' : 'user';
  const allowed = user.role === 'admin' ||
    (sub.owner_id === user.id && sub.owner_type === ownerType && (user.role === 'school' || user.role === 'teacher' || user.role === 'student'));
  if (!allowed) return c.json({ success: false, message: 'غير مصرح' }, 403);
  const cancelled = await svc.cancelSubscription(id);
  if (cancelled) {
    dispatchEvent({
      type: 'subscription_cancelled',
      actorId: user.id,
      actorName: user.name || 'الأدمن',
      actorRole: user.role === 'admin' ? 'admin' : 'school',
      payload: { userId: cancelled.owner_type === 'user' ? cancelled.owner_id : undefined, schoolId: cancelled.owner_type === 'school' ? cancelled.owner_id : undefined, message: `تم إلغاء الاشتراك: ${cancelled.plan_name || ''}` },
    }).catch(() => {});
  }
  return c.json({ success: true });
});

export { app as subscriptionRoutes };
