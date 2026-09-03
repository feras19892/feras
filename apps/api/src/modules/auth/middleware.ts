import type { MiddlewareHandler, Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyAccessToken } from './jwt.js';
import { getUserById } from './services.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';
import { getSchoolById } from '../school/services.js';
import { getActiveSubscription } from '../subscriptions/services.js';

function getTokenFromHeader(c: Context): string | undefined {
  const auth = c.req.header('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return undefined;
}

const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/system-status',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/school/login',
  '/api/school/register',
];

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const path = c.req.path;
  if (
    PUBLIC_AUTH_PATHS.includes(path) ||
    path.startsWith('/api/health') ||
    path === '/api/subscriptions/plans' ||
    path === '/api/settings/subscription'
  ) {
    await next();
    return;
  }

  const accessToken = getTokenFromHeader(c) || getCookie(c, 'access_token');
  if (!accessToken) {
    return c.json({ success: false, message: 'غير مصرح' }, 401);
  }
  try {
    const payload = await verifyAccessToken(accessToken);

    // School role: fetch from schools table
    if (payload.role === 'school') {
      const school = await db.get<{ id: number; email: string; name: string; is_active: number }>(
        'SELECT id, email, name, is_active FROM schools WHERE id = ?', Number(payload.sub)
      );
      if (!school) {
        return c.json({ success: false, message: 'المدرسة غير موجودة' }, 401);
      }
      if (!school.is_active) {
        return c.json({ success: false, message: 'حساب المدرسة معطل' }, 403);
      }
      c.set('user', {
        id: school.id,
        email: school.email,
        name: school.name,
        role: 'school' as User['role'],
      } as User);
      const sub = await getActiveSubscription(school.id, 'school');
      c.set('subscription', sub);
      if (!sub) {
        return c.json({ success: false, message: 'انتهت فترة التجربة أو الاشتراك، يرجى الاشتراك', expired: true }, 403);
      }
      await next();
      return;
    }

    const user = await getUserById(Number(payload.sub));
    if (!user) {
      return c.json({ success: false, message: 'المستخدم غير موجود' }, 401);
    }
    const userBlock = await db.get<{ blocked_at: string | null; block_until: string | null; block_reason: string | null }>(
      'SELECT blocked_at, block_until, block_reason FROM users WHERE id = ?', Number(payload.sub),
    );
    if (userBlock?.blocked_at) {
      const now = new Date().toISOString();
      if (!userBlock.block_until || userBlock.block_until > now) {
        const reason = userBlock.block_reason || 'الحساب محظور';
        return c.json({ success: false, message: `أنت معاقب: ${reason}`, blocked: true }, 403);
      }
    }
    c.set('user', user);
    if (user.role === 'admin') {
      await next();
      return;
    }
    if (path.startsWith('/api/health') || path.startsWith('/api/subscriptions') || path.startsWith('/api/settings') || path.startsWith('/api/auth')) {
      await next();
      return;
    }

    // Members of a school rely on the school's active subscription and membership status.
    if (user.school_id) {
      const membership = await db.get<{ status: string }>(
        'SELECT status FROM tenant_memberships WHERE member_id = ? AND tenant_id = ? AND tenant_type = ?',
        user.id,
        user.school_id,
        'school',
      );
      if (!membership || membership.status !== 'active') {
        return c.json({ success: false, message: 'حسابك غير مفعل في هذه المدرسة' }, 403);
      }
      const sub = await getActiveSubscription(user.school_id, 'school');
      c.set('subscription', sub);
      if (!sub) {
        return c.json({ success: false, message: 'انتهى اشتراك المدرسة، يرجى تجديده' }, 403);
      }
      await next();
      return;
    }

    const sub = await getActiveSubscription(user.id, 'user');
    c.set('subscription', sub);
    if (!sub) {
      return c.json({ success: false, message: 'انتهت فترة التجربة أو الاشتراك، يرجى الاشتراك', expired: true }, 403);
    }
    await next();
  } catch {
    return c.json({ success: false, message: 'رمز غير صالح أو منتهي الصلاحية' }, 401);
  }
};

export const schoolAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const path = c.req.path;
  if (path === '/api/school/login' || path === '/api/school/register') {
    await next();
    return;
  }

  const token = getCookie(c, 'access_token') || getTokenFromHeader(c);
  if (!token) return c.json({ success: false, message: 'غير مصرح' }, 401);
  try {
    const payload = await verifyAccessToken(token);

    // Admin may access the school-module admin sub-routes ONLY (/api/school/admin/*).
    // These routes are additionally guarded inline by adminAuthMiddleware.
    if (payload.role !== 'school') {
      if (payload.role !== 'admin' || !path.startsWith('/api/school/admin/')) {
        return c.json({ success: false, message: 'مطلوب صلاحية مدرسة' }, 403);
      }
      const adminUser = c.get('user') as User | undefined;
      if (!adminUser) return c.json({ success: false, message: 'غير مصرح' }, 401);
      await next();
      return;
    }

    const school = await getSchoolById(Number(payload.sub));
    if (!school) return c.json({ success: false, message: 'المدرسة غير موجودة' }, 401);
    if (!school.is_active) return c.json({ success: false, message: 'حساب المدرسة معطل' }, 403);
    c.set('school', school);
    if (path.startsWith('/api/health') || path.startsWith('/api/subscriptions') || path.startsWith('/api/settings') || path.startsWith('/api/auth')) {
      await next();
      return;
    }
    const sub = await getActiveSubscription(school.id, 'school');
    c.set('subscription', sub);
    if (!sub) {
      return c.json({ success: false, message: 'انتهت فترة التجربة أو الاشتراك، يرجى الاشتراك', expired: true }, 403);
    }
    await next();
  } catch {
    return c.json({ success: false, message: 'رمز غير صالح أو منتهي الصلاحية' }, 401);
  }
};

export const adminAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const token = getCookie(c, 'access_token') || getTokenFromHeader(c);
  if (!token) return c.json({ success: false, message: 'غير مصرح' }, 401);
  try {
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'admin') return c.json({ success: false, message: 'مطلوب صلاحية أدمن' }, 403);
    const admin = await db.get<{ id: number; name: string; email: string; blocked_at: string | null; block_until: string | null }>(
      'SELECT id, name, email, blocked_at, block_until FROM users WHERE id = ?', Number(payload.sub),
    );
    if (!admin) return c.json({ success: false, message: 'الأدمن غير موجود' }, 401);
    if (admin.blocked_at) {
      const now = new Date().toISOString();
      if (!admin.block_until || admin.block_until > now) {
        return c.json({ success: false, message: 'الحساب محظور' }, 403);
      }
    }
    c.set('user', { id: admin.id, name: admin.name, email: admin.email, role: 'admin' } as User);
    await next();
  } catch {
    return c.json({ success: false, message: 'رمز غير صالح أو منتهي الصلاحية' }, 401);
  }
};

export const teacherAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const user = c.get('user') as User | undefined;
  if (!user) {
    return c.json({ success: false, message: 'غير مصرح' }, 401);
  }
  if (user.role !== 'teacher') {
    return c.json({ success: false, message: 'مطلوب صلاحية معلم' }, 403);
  }
  await next();
};
