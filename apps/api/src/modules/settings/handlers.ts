import { Hono } from 'hono';
import { authMiddleware } from '../auth/middleware.js';
import { db } from '../../db/index.js';
import { updateSystemSetting } from '../admin/services-core.js';
import type { User } from '@my-modern-app/shared-types';

const DEFAULT_SUBSCRIPTION_SETTINGS: Record<string, string> = {
  student_price_month_cents: '200',
  student_price_year_cents: '1900',
  student_premium_price_month_cents: '1900',
  teacher_price_student_month_cents: '150',
  teacher_price_student_year_cents: '1300',
  teacher_free_threshold: '10',
  school_teacher_price_month_cents: '100',
  school_teacher_price_year_cents: '1000',
  school_student_price_month_cents: '100',
  school_student_price_year_cents: '1000',
  school_free_teachers: '15',
  school_free_students: '0',
  free_account_label: '✅ حسابك مجاني',
  no_subscription_title: 'لا يوجد اشتراك نشط',
  student_plan_title: 'اشترك الآن',
  student_plan_basic_name: 'الطلاب',
  student_plan_basic_desc: 'وصول كامل لكل التجارب والتقارير',
  student_plan_premium_name: 'طلاب — خطة مميزة',
  student_plan_premium_desc: 'مميزات إضافية ودعم ممتد',
};

const settingsRoutes = new Hono<{ Variables: { user: User } }>();

settingsRoutes.use(authMiddleware);

settingsRoutes.get('/', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') {
    return c.json({ success: false, message: 'Admin only' }, 403);
  }
  const rows = await db.all<{ key: string; value: string }[]>(
    'SELECT key, value FROM system_settings WHERE key NOT IN (?)',
    'emergency_password',
  );
  const data: Record<string, string | boolean | number> = {};
  for (const row of rows) {
    if (row.value === 'true') data[row.key] = true;
    else if (row.value === 'false') data[row.key] = false;
    else if (/^\d+$/.test(row.value)) data[row.key] = Number(row.value);
    else data[row.key] = row.value;
  }
  return c.json({ success: true, data });
});

settingsRoutes.get('/subscription', async (c) => {
  const rows = await db.all<{ key: string; value: string }[]>(
    "SELECT key, value FROM system_settings WHERE key LIKE 'student_%' OR key LIKE 'teacher_%' OR key LIKE 'school_%' OR key IN ('free_account_label','no_subscription_title','student_plan_title','student_plan_basic_name','student_plan_basic_desc','student_plan_premium_name','student_plan_premium_desc')"
  );
  const data: Record<string, string> = { ...DEFAULT_SUBSCRIPTION_SETTINGS };
  for (const row of rows) data[row.key] = row.value;
  return c.json({ success: true, data });
});

settingsRoutes.patch('/:key', async (c) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ success: false, message: 'Admin only' }, 403);
  const key = c.req.param('key');
  const { value } = await c.req.json();
  if (value !== 'true' && value !== 'false' && typeof value !== 'string') {
    return c.json({ success: false, message: 'Value must be true/false or string' }, 400);
  }
  const str = String(value);
  await updateSystemSetting(key, str, user.id);
  return c.json({ success: true, value: str });
});

export { settingsRoutes };
