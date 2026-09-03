import { db } from '../../db/index.js';
import { createNotification } from '../notifications/services.js';
import { scheduleForSubscription, rescheduleForPayment, notifySubscriptionEvent } from '../notifications/queue.js';
import type { Plan, PlanPackage, PlanWithPackages, Subscription, SubscriptionWithPlan, CreateSubscriptionInput, PlanType, BillingInterval } from './types.js';

export async function getPlans(type?: PlanType): Promise<PlanWithPackages[]> {
  const plans = type
    ? await db.all<Plan[]>('SELECT * FROM plans WHERE type = ? AND is_active = 1 ORDER BY price_cents', type)
    : await db.all<Plan[]>('SELECT * FROM plans WHERE is_active = 1 ORDER BY type, price_cents');

  const planIds = plans.map((p) => p.id);
  if (planIds.length === 0) return plans.map((p) => ({ ...p, packages: [] }));

  const placeholders = planIds.map(() => '?').join(',');
  const packages = await db.all<PlanPackage[]>(
    `SELECT * FROM plan_packages WHERE plan_id IN (${placeholders}) AND is_active = 1 AND archived_at IS NULL ORDER BY created_at`,
    ...planIds,
  );

  const packagesByPlan = new Map<number, PlanPackage[]>();
  for (const pkg of packages) {
    const list = packagesByPlan.get(pkg.plan_id) ?? [];
    list.push(pkg);
    packagesByPlan.set(pkg.plan_id, list);
  }

  return plans.map((p) => ({ ...p, packages: packagesByPlan.get(p.id) ?? [] }));
}

export async function getPlanById(id: number): Promise<Plan | undefined> {
  return db.get<Plan>('SELECT * FROM plans WHERE id = ?', id);
}

export async function getActiveSubscription(
  ownerId: number,
  ownerType: 'user' | 'school',
): Promise<SubscriptionWithPlan | undefined> {
  const row = await db.get<SubscriptionWithPlan>(
    `SELECT s.*, p.name as plan_name, p.type as plan_type, p.price_cents
     FROM subscriptions s
     LEFT JOIN plans p ON p.id = s.plan_id
     WHERE s.owner_id = ? AND s.owner_type = ? AND s.status IN ('ACTIVE','TRIAL')
       AND (s.expires_at IS NULL OR s.expires_at > datetime('now'))
     ORDER BY s.created_at DESC LIMIT 1`,
    ownerId,
    ownerType,
  );
  return row;
}

export async function createSubscription(input: CreateSubscriptionInput): Promise<number> {
  const now = new Date().toISOString();
  const status = input.status ?? 'PENDING';
  const startsAt = input.starts_at ?? now;
  const expiresAt = input.expires_at ?? (status === 'TRIAL' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null);
  const nextBillingAt = input.next_billing_at ?? (status === 'ACTIVE' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null);
  try {
    await db.exec('BEGIN');
    await db.run(
      `UPDATE subscriptions SET status = 'CANCELLED', cancelled_at = ?, updated_at = ?
       WHERE owner_id = ? AND owner_type = ? AND status IN ('ACTIVE','TRIAL','PENDING')`,
      now,
      now,
      input.owner_id,
      input.owner_type,
    );
    const result = await db.run(
      `INSERT INTO subscriptions
       (owner_id, owner_type, plan_id, status, starts_at, expires_at, next_billing_at, payment_provider, payment_reference, max_students, max_teachers, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.owner_id,
      input.owner_type,
      input.plan_id ?? null,
      status,
      startsAt,
      expiresAt,
      nextBillingAt,
      input.payment_provider ?? null,
      input.payment_reference ?? null,
      input.max_students ?? null,
      input.max_teachers ?? null,
      now,
      now,
    );
    await db.exec('COMMIT');
    const newSub = await getSubscriptionById(Number(result.lastID));
    if (newSub) {
      void scheduleForSubscription(newSub).catch(() => {});
      if (newSub.status === 'TRIAL' && newSub.expires_at) {
        void notifySubscriptionEvent(newSub, 'trial_started', newSub.expires_at).catch(() => {});
      } else if (newSub.status === 'ACTIVE') {
        void notifySubscriptionEvent(newSub, 'subscription_renewed').catch(() => {});
      }
      if (newSub.owner_type === 'school' && (newSub.status === 'ACTIVE' || newSub.status === 'TRIAL')) {
        void syncSchoolMembersStatus(newSub.owner_id, true).catch(() => {});
      }
    }
    return Number(result.lastID);
  } catch (err) {
    await db.exec('ROLLBACK').catch(() => {});
    throw err;
  }
}

export async function getSubscriptionById(id: number): Promise<SubscriptionWithPlan | undefined> {
  return db.get<SubscriptionWithPlan>(
    `SELECT s.*, p.name as plan_name, p.type as plan_type, p.price_cents,
            COALESCE(u.name, sch.name, '—') as owner_name,
            COALESCE(u.email, sch.email, '') as owner_email
     FROM subscriptions s
     LEFT JOIN plans p ON p.id = s.plan_id
     LEFT JOIN users u ON s.owner_type = 'user' AND u.id = s.owner_id
     LEFT JOIN schools sch ON s.owner_type = 'school' AND sch.id = s.owner_id
     WHERE s.id = ?`,
    id,
  );
}

export async function updateSubscription(
  id: number,
  updates: Partial<Record<string, unknown>>,
): Promise<SubscriptionWithPlan | undefined> {
  const current = await db.get<{ owner_id: number; owner_type: string }>(
    'SELECT owner_id, owner_type FROM subscriptions WHERE id = ?',
    id,
  );
  if (!current) return;
  const fields: string[] = [];
  const values: unknown[] = [];
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.plan_id !== undefined) { fields.push('plan_id = ?'); values.push(updates.plan_id); }
  if (updates.expires_at !== undefined) { fields.push('expires_at = ?'); values.push(updates.expires_at); }
  if (updates.last_payment_at !== undefined) { fields.push('last_payment_at = ?'); values.push(updates.last_payment_at); }
  if (updates.next_billing_at !== undefined) { fields.push('next_billing_at = ?'); values.push(updates.next_billing_at); }
  if (updates.cancelled_at !== undefined) { fields.push('cancelled_at = ?'); values.push(updates.cancelled_at); }
  if (updates.payment_provider !== undefined) { fields.push('payment_provider = ?'); values.push(updates.payment_provider); }
  if (updates.payment_reference !== undefined) { fields.push('payment_reference = ?'); values.push(updates.payment_reference); }
  if (updates.max_students !== undefined) { fields.push('max_students = ?'); values.push(updates.max_students); }
  if (updates.max_teachers !== undefined) { fields.push('max_teachers = ?'); values.push(updates.max_teachers); }
  if (fields.length === 0) return getSubscriptionById(id);
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);
  await db.run(`UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`, ...values);
  const updated = await getSubscriptionById(id);
  if (updated && (updates.status === 'ACTIVE' || updates.next_billing_at !== undefined)) {
    void rescheduleForPayment(updated).catch(() => {});
  }
  if (updated && updated.owner_type === 'school' && updates.status !== undefined) {
    void syncSchoolMembersStatus(updated.owner_id, ['ACTIVE', 'TRIAL'].includes(updated.status)).catch(() => {});
  }
  return updated;
}

export async function cancelSubscription(id: number): Promise<SubscriptionWithPlan | undefined> {
  const current = await db.get<{ owner_id: number; owner_type: string }>(
    'SELECT owner_id, owner_type FROM subscriptions WHERE id = ?',
    id,
  );
  if (!current) return;
  await db.run(
    `UPDATE subscriptions SET status = 'CANCELLED', cancelled_at = ?, updated_at = ? WHERE id = ?`,
    new Date().toISOString(),
    new Date().toISOString(),
    id,
  );
  const cancelled = await getSubscriptionById(id);
  if (cancelled) {
    if (cancelled.owner_type === 'school') {
      void syncSchoolMembersStatus(cancelled.owner_id, false).catch(() => {});
    }
    const eventDate = cancelled.cancelled_at ?? cancelled.expires_at ?? undefined;
    void notifySubscriptionEvent(cancelled, 'subscription_cancelled', eventDate).catch(() => {});
  }
  return cancelled;
}

export async function getAllSubscriptions(limit = 200): Promise<SubscriptionWithPlan[]> {
  return db.all<SubscriptionWithPlan[]>(
    `SELECT s.*, p.name as plan_name, p.type as plan_type, p.price_cents,
            COALESCE(u.name, sch.name, '—') as owner_name,
            COALESCE(u.email, sch.email, '') as owner_email
     FROM subscriptions s
     LEFT JOIN plans p ON p.id = s.plan_id
     LEFT JOIN users u ON s.owner_type = 'user' AND u.id = s.owner_id
     LEFT JOIN schools sch ON s.owner_type = 'school' AND sch.id = s.owner_id
     ORDER BY s.created_at DESC LIMIT ?`,
    limit,
  );
}

export async function getAdminSubscriptions(
  options: {
    status?: string;
    ownerType?: 'user' | 'school';
    search?: string;
    sort?: 'created_at' | 'expires_at' | 'price_cents';
    order?: 'asc' | 'desc';
    page: number;
    limit: number;
  },
): Promise<SubscriptionWithPlan[]> {
  const { status, ownerType, search, sort = 'created_at', order = 'desc', page, limit } = options;
  const wheres: string[] = [];
  const values: unknown[] = [];
  if (status) { wheres.push('s.status = ?'); values.push(status); }
  if (ownerType) { wheres.push('s.owner_type = ?'); values.push(ownerType); }
  if (search) {
    wheres.push("(s.owner_id LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR sch.name LIKE ?)");
    const like = `%${search}%`;
    values.push(like, like, like, like);
  }
  const where = wheres.length ? `WHERE ${wheres.join(' AND ')}` : '';
  const orderBy = ['s.created_at', 's.expires_at', 'p.price_cents'].includes(`s.${sort}`) || sort === 'price_cents'
    ? `ORDER BY ${sort === 'price_cents' ? 'p.price_cents' : `s.${sort}`} ${order.toUpperCase()}`
    : 'ORDER BY s.created_at DESC';
  const offset = (page - 1) * limit;
  return db.all<SubscriptionWithPlan[]>(
    `SELECT s.*, p.name as plan_name, p.type as plan_type, p.price_cents,
            COALESCE(u.name, sch.name, '—') as owner_name,
            COALESCE(u.email, sch.email, '') as owner_email
     FROM subscriptions s
     LEFT JOIN plans p ON p.id = s.plan_id
     LEFT JOIN users u ON s.owner_type = 'user' AND u.id = s.owner_id
     LEFT JOIN schools sch ON s.owner_type = 'school' AND sch.id = s.owner_id
     ${where}
     ${orderBy}
     LIMIT ? OFFSET ?`,
    ...values,
    limit,
    offset,
  );
}

export async function autoExpireSubscriptions(): Promise<number> {
  const now = new Date().toISOString();
  const subs = await db.all<Subscription[]>(
    `SELECT * FROM subscriptions
     WHERE status IN ('ACTIVE','TRIAL') AND expires_at IS NOT NULL AND expires_at < ?`,
    now,
  );
  for (const sub of subs) {
    await db.run(
      `UPDATE subscriptions SET status = 'EXPIRED', updated_at = ? WHERE id = ?`,
      now,
      sub.id,
    );
    if (sub.owner_type === 'school') {
      void syncSchoolMembersStatus(sub.owner_id, false).catch(() => {});
    }
    const event = sub.status === 'TRIAL' ? 'trial_ended' : 'subscription_expired';
    void notifySubscriptionEvent(sub, event, sub.expires_at ?? undefined).catch(() => {});
  }
  return subs.length;
}

export async function seedDefaultPlans(): Promise<void> {
  const existing = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM plans');
  if (existing && existing.cnt > 0) return;
  const plans: { type: PlanType; name: string; price_cents: number; billing_interval: BillingInterval; features: string }[] = [
    { type: 'student', name: 'اشتراك الطالب', price_cents: 200, billing_interval: 'month', features: JSON.stringify({ description: '2€/شهر' }) },
    { type: 'teacher', name: 'اشتراك المدرس', price_cents: 150, billing_interval: 'month', features: JSON.stringify({ description: '1.5€/طالب/شهر', free_threshold: 10 }) },
    { type: 'school', name: 'اشتراك المدرسة', price_cents: 100, billing_interval: 'month', features: JSON.stringify({ description: '1€/طالب/شهر', free_teachers: 15 }) },
  ];
  for (const p of plans) {
    await db.run(
      'INSERT INTO plans (type, name, price_cents, billing_interval, features) VALUES (?, ?, ?, ?, ?)',
      p.type,
      p.name,
      p.price_cents,
      p.billing_interval,
      p.features,
    );
  }
}

async function syncSchoolMembersStatus(schoolId: number, active: boolean): Promise<void> {
  const now = new Date().toISOString();
  if (active) {
    await db.run(
      'UPDATE tenant_memberships SET status = ? WHERE tenant_id = ? AND tenant_type = ?',
      'active',
      schoolId,
      'school',
    );
    await db.run(
      'UPDATE users SET blocked_at = NULL, block_reason = NULL WHERE id IN (SELECT member_id FROM tenant_memberships WHERE tenant_id = ? AND tenant_type = ?)',
      schoolId,
      'school',
    );
    const members = await db.all<{ member_id: number }[]>(
      'SELECT member_id FROM tenant_memberships WHERE tenant_id = ? AND tenant_type = ?',
      schoolId,
      'school',
    );
    for (const m of members) {
      void createNotification({
        user_id: m.member_id,
        type: 'account_activated',
        title: 'تم تفعيل حسابك',
        message: 'تم تجديد اشتراك المدرسة، حسابك مفعل مجدداً',
      }).catch(() => {});
    }
  } else {
    await db.run(
      'UPDATE tenant_memberships SET status = ? WHERE tenant_id = ? AND tenant_type = ?',
      'suspended',
      schoolId,
      'school',
    );
    await db.run(
      'UPDATE users SET blocked_at = ?, block_reason = ? WHERE id IN (SELECT member_id FROM tenant_memberships WHERE tenant_id = ? AND tenant_type = ?)',
      now,
      'انتهى اشتراك المدرسة',
      schoolId,
      'school',
    );
    const members = await db.all<{ member_id: number }[]>(
      'SELECT member_id FROM tenant_memberships WHERE tenant_id = ? AND tenant_type = ?',
      schoolId,
      'school',
    );
    for (const m of members) {
      void createNotification({
        user_id: m.member_id,
        type: 'account_suspended',
        title: 'حسابك موقوف',
        message: 'انتهى اشتراك المدرسة، يرجى التواصل مع الإدارة',
      }).catch(() => {});
    }
  }
}
