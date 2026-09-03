import { db } from '../../db/index.js';
import { createNotification, createSchoolNotification } from './services.js';

interface Template {
  key: string;
  role: string;
  event: string;
  days_before: number;
  hour: number;
  minute: number;
  ar_title: string;
  ar_body: string;
  en_title: string;
  en_body: string;
  es_title: string;
  es_body: string;
}

interface User {
  id: number;
  name: string;
  role: string;
  lang: string;
}

interface School {
  id: number;
  name: string;
  email: string;
}

interface Subscription {
  id: number;
  owner_id: number;
  owner_type: 'user' | 'school';
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  next_billing_at: string | null;
}

function localize(template: Template, lang: string) {
  if (lang === 'en') return { title: template.en_title, body: template.en_body };
  if (lang === 'es') return { title: template.es_title, body: template.es_body };
  return { title: template.ar_title, body: template.ar_body };
}

function render(text: string, vars: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => vars[key] ?? '');
}

function scheduleAt(eventDate: string, daysBefore: number, hour: number, minute: number) {
  const d = new Date(eventDate);
  d.setUTCDate(d.getUTCDate() - daysBefore);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

function toDateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

function fmtDate(date: Date, lang: string) {
  const locale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'ar-SA';
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

function fmtTime(date: Date, lang: string) {
  const locale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'ar-SA';
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
}

async function getOwner(sub: Subscription): Promise<{ userId?: number; schoolId?: number; name: string; lang: string }> {
  if (sub.owner_type === 'school') {
    const school = await db.get<School>('SELECT id, name, email FROM schools WHERE id = ?', sub.owner_id);
    return { schoolId: school?.id, name: school?.name ?? '', lang: 'ar' };
  }
  const user = await db.get<User>('SELECT id, name, role, lang FROM users WHERE id = ?', sub.owner_id);
  return { userId: user?.id, name: user?.name ?? '', lang: user?.lang ?? 'ar' };
}

export async function scheduleForSubscription(sub: Subscription) {
  await purgePendingForSubscription(sub.owner_id, sub.owner_type);
  let role = 'all';
  if (sub.owner_type === 'user') {
    const u = await db.get<{ role: string }>('SELECT role FROM users WHERE id = ?', sub.owner_id);
    if (u) role = u.role;
  }
  const templates = await db.all<Template[]>(
    `SELECT * FROM notification_templates WHERE is_active = 1 AND (role = 'all' OR role = ?)
     ORDER BY event, days_before`,
    role,
  );

  const owner = await getOwner(sub);
  const toInsert: {
    userId?: number; schoolId?: number; event: string; eventDate: string; scheduledAt: string;
    title: string; message: string; lang: string;
  }[] = [];

  for (const tpl of templates) {
    let eventDate: string | null = null;
    if (tpl.event === 'trial_ends' && sub.expires_at && sub.status === 'TRIAL') {
      eventDate = toDateKey(new Date(sub.expires_at));
    } else if ((tpl.event === 'yearly_renewal' || tpl.event === 'payment_due') && sub.next_billing_at) {
      eventDate = toDateKey(new Date(sub.next_billing_at));
    }
    if (!eventDate) continue;
    const date = new Date(eventDate);
    const scheduledAt = scheduleAt(eventDate, tpl.days_before, tpl.hour, tpl.minute);
    if (new Date(scheduledAt) < new Date(sub.starts_at ?? new Date().toISOString())) continue;
    const { title, body } = localize(tpl, owner.lang);
    const vars = {
      name: owner.name,
      date: fmtDate(date, owner.lang),
      time: fmtTime(new Date(eventDate + 'T' + String(tpl.hour).padStart(2, '0') + ':' + String(tpl.minute).padStart(2, '0') + ':00Z'), owner.lang),
    };
    toInsert.push({
      userId: owner.userId,
      schoolId: owner.schoolId,
      event: tpl.event,
      eventDate,
      scheduledAt,
      title: render(title, vars),
      message: render(body, vars),
      lang: owner.lang,
    });
  }

  for (const item of toInsert) {
    await db.run(
      `INSERT OR IGNORE INTO subscription_notification_queue
       (user_id, school_id, owner_id, owner_type, template_key, event, event_date, scheduled_at, title, message, lang, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      item.userId ?? null,
      item.schoolId ?? null,
      sub.owner_id,
      sub.owner_type,
      null,
      item.event,
      item.eventDate,
      item.scheduledAt,
      item.title,
      item.message,
      item.lang,
    );
  }
}

export async function purgePendingForSubscription(ownerId: number, ownerType: 'user' | 'school', event?: string) {
  const eventFilter = event ? 'AND event = ?' : '';
  await db.run(
    `UPDATE subscription_notification_queue
     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
     WHERE owner_id = ? AND owner_type = ? AND status = 'pending' ${eventFilter}`,
    ownerId,
    ownerType,
    ...(event ? [event] : []),
  );
}

export async function sendPendingNotifications() {
  const now = new Date().toISOString();
  const rows = await db.all<
    { id: number; user_id?: number; school_id?: number; title: string; message: string; attempts: number }[]
  >(
    `SELECT id, user_id, school_id, title, message, attempts
     FROM subscription_notification_queue
     WHERE status = 'pending' AND scheduled_at <= ? AND attempts < 3
     ORDER BY scheduled_at
     LIMIT 100`,
    now,
  );

  for (const row of rows) {
    try {
      if (row.user_id) {
        await createNotification({ user_id: row.user_id, type: 'subscription', title: row.title, message: row.message });
      } else if (row.school_id) {
        await createSchoolNotification({ school_id: row.school_id, type: 'subscription', title: row.title, message: row.message });
      }
      await db.run(
        `UPDATE subscription_notification_queue SET status = 'sent', attempts = attempts + 1, sent_at = CURRENT_TIMESTAMP WHERE id = ?`,
        row.id,
      );
    } catch (err) {
      await db.run(
        `UPDATE subscription_notification_queue SET attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        row.id,
      );
    }
  }
}

export async function rescheduleForPayment(sub: Subscription) {
  if (sub.next_billing_at && sub.status === 'ACTIVE') {
    await scheduleForSubscription(sub);
  }
}

export async function notifySubscriptionEvent(
  sub: Subscription,
  eventKey: string,
  eventDate?: string,
) {
  if (sub.owner_type !== 'user' && sub.owner_type !== 'school') return;
  const tpl = await db.get<Template>(
    'SELECT * FROM notification_templates WHERE is_active = 1 AND key = ?',
    eventKey,
  );
  if (!tpl) return;

  let role = 'all';
  if (sub.owner_type === 'user') {
    const u = await db.get<{ role: string }>('SELECT role FROM users WHERE id = ?', sub.owner_id);
    if (u) role = u.role;
  }
  if (tpl.role !== 'all' && tpl.role !== role) return;

  const owner = await getOwner(sub);
  const rawDate = eventDate ?? sub.expires_at ?? sub.next_billing_at ?? sub.starts_at;
  if (!rawDate) return;
  const date = new Date(rawDate);
  const dateKey = toDateKey(date);
  const { title, body } = localize(tpl, owner.lang);
  const vars = {
    name: owner.name,
    date: fmtDate(date, owner.lang),
    time: fmtTime(
      new Date(`${dateKey}T${String(tpl.hour).padStart(2, '0')}:${String(tpl.minute).padStart(2, '0')}:00Z`),
      owner.lang,
    ),
  };
  const renderedTitle = render(title, vars);
  const renderedBody = render(body, vars);

  if (owner.userId) {
    await createNotification({
      user_id: owner.userId,
      type: 'subscription',
      title: renderedTitle,
      message: renderedBody,
    });
  } else if (owner.schoolId) {
    await createSchoolNotification({
      school_id: owner.schoolId,
      type: 'subscription',
      title: renderedTitle,
      message: renderedBody,
    });
  }
}

export async function generateQueueForAll() {
  const subs = await db.all<Subscription[]>(
    `SELECT * FROM subscriptions WHERE status IN ('TRIAL','ACTIVE')`,
  );
  for (const sub of subs) {
    await purgePendingForSubscription(sub.owner_id, sub.owner_type);
    await scheduleForSubscription(sub);
  }
  return { success: true, count: subs.length };
}
