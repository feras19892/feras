import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';
import type { Plan, PlanPackage } from '../subscriptions/types.js';

const createPlanSchema = z.object({
  type: z.enum(['student', 'teacher', 'school']),
  name: z.string().min(1).max(200),
  currency: z.string().max(3).default('EUR'),
  features: z.string().max(4000).nullable().optional(),
  is_active: z.number().int().min(0).max(1).default(1).optional(),
});

const updatePlanSchema = createPlanSchema.partial();

const createPackageSchema = z.object({
  teacher_count: z.number().int().min(0),
  student_count: z.number().int().min(0),
  price_cents_monthly: z.number().int().min(0),
  price_cents_yearly: z.number().int().min(0),
  currency: z.string().max(3).default('EUR'),
  stripe_product_id: z.string().max(255).nullable().optional(),
  stripe_price_id_monthly: z.string().max(255).nullable().optional(),
  stripe_price_id_yearly: z.string().max(255).nullable().optional(),
});

export function registerSubscriptionAdminRoutes(
  app: Hono<{ Variables: { user: User } }>,
): void {
  app.get('/subscriptions/plans', async (c) => {
    const plans = await db.all<Plan[]>(
      `SELECT id, type, name, currency, features, is_active,
              created_at, COALESCE(updated_at, created_at) as updated_at,
              (SELECT COUNT(*) FROM plan_packages
                WHERE plan_packages.plan_id = plans.id
                  AND archived_at IS NULL
                  AND is_active = 1) as package_count
       FROM plans
       ORDER BY type, id`,
    );
    return c.json({ success: true, plans });
  });

  app.post('/subscriptions/plans', zValidator('json', createPlanSchema), async (c) => {
    const body = c.req.valid('json');
    const result = await db.run(
      `INSERT INTO plans (type, name, price_cents, billing_interval, currency, features, is_active, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      body.type,
      body.name,
      0,
      'month',
      body.currency,
      body.features ?? null,
      body.is_active ?? 1,
    );
    return c.json({ success: true, id: Number(result.lastID) }, 201);
  });

  app.patch('/subscriptions/plans/:id', zValidator('json', updatePlanSchema), async (c) => {
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');
    const fields: string[] = [];
    const values: unknown[] = [];
    if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name); }
    if (body.currency !== undefined) { fields.push('currency = ?'); values.push(body.currency); }
    if (body.features !== undefined) { fields.push('features = ?'); values.push(body.features); }
    if (body.is_active !== undefined) { fields.push('is_active = ?'); values.push(body.is_active); }
    if (fields.length === 0) {
      return c.json({ success: false, message: 'لا توجد بيانات للتحديث' }, 400);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    await db.run(`UPDATE plans SET ${fields.join(', ')} WHERE id = ?`, ...values, id);
    return c.json({ success: true });
  });

  app.post('/subscriptions/plans/:id/toggle', async (c) => {
    const id = Number(c.req.param('id'));
    const current = await db.get<{ is_active: number }>(
      'SELECT is_active FROM plans WHERE id = ?',
      id,
    );
    if (!current) {
      return c.json({ success: false, message: 'الخطة غير موجودة' }, 404);
    }
    const next = current.is_active ? 0 : 1;
    await db.run(
      'UPDATE plans SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      next,
      id,
    );
    return c.json({ success: true, is_active: next });
  });

  app.delete('/subscriptions/plans/:id', async (c) => {
    const id = Number(c.req.param('id'));
    await db.run(
      'UPDATE plans SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      id,
    );
    return c.json({ success: true });
  });

  app.get('/subscriptions/plans/:id/packages', async (c) => {
    const planId = Number(c.req.param('id'));
    const packages = await db.all<PlanPackage[]>(
      `SELECT id, plan_id, teacher_count, student_count,
              price_cents_monthly, price_cents_yearly, currency,
              stripe_product_id, stripe_price_id_monthly, stripe_price_id_yearly,
              is_active, archived_at, created_at, updated_at
       FROM plan_packages
       WHERE plan_id = ? AND archived_at IS NULL
       ORDER BY price_cents_monthly`,
      planId,
    );
    return c.json({ success: true, packages });
  });

  app.post('/subscriptions/plans/:id/packages', zValidator('json', createPackageSchema), async (c) => {
    const planId = Number(c.req.param('id'));
    const body = c.req.valid('json');
    const existing = await db.get<{ id: number }>(
      'SELECT id FROM plans WHERE id = ?',
      planId,
    );
    if (!existing) {
      return c.json({ success: false, message: 'الخطة غير موجودة' }, 404);
    }
    const result = await db.run(
      `INSERT INTO plan_packages (
         plan_id, teacher_count, student_count,
         price_cents_monthly, price_cents_yearly, currency,
         stripe_product_id, stripe_price_id_monthly, stripe_price_id_yearly
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      planId,
      body.teacher_count,
      body.student_count,
      body.price_cents_monthly,
      body.price_cents_yearly,
      body.currency,
      body.stripe_product_id ?? null,
      body.stripe_price_id_monthly ?? null,
      body.stripe_price_id_yearly ?? null,
    );
    return c.json({ success: true, id: Number(result.lastID) }, 201);
  });

  app.delete('/subscriptions/plans/:planId/packages/:pkgId', async (c) => {
    const planId = Number(c.req.param('planId'));
    const pkgId = Number(c.req.param('pkgId'));
    await db.run(
      `UPDATE plan_packages
       SET archived_at = CURRENT_TIMESTAMP, is_active = 0, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND plan_id = ?`,
      pkgId,
      planId,
    );
    return c.json({ success: true });
  });
}
