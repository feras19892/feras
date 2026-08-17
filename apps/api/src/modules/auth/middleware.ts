import type { MiddlewareHandler, Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyAccessToken } from './jwt.js';
import { getUserById } from './services.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';
import { getSchoolById } from '../school/services.js';

function getTokenFromHeader(c: Context): string | undefined {
  const auth = c.req.header('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return undefined;
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const accessToken = getCookie(c, 'access_token') || getTokenFromHeader(c);
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
      await next();
      return;
    }

    const user = await getUserById(Number(payload.sub));
    if (!user) {
      return c.json({ success: false, message: 'المستخدم غير موجود' }, 401);
    }
    const userBlock = await db.get<{ blocked_at: string | null }>(
      'SELECT blocked_at FROM users WHERE id = ?', Number(payload.sub),
    );
    if (userBlock?.blocked_at) {
      return c.json({ success: false, message: 'الحساب محظور' }, 403);
    }
    c.set('user', user);
    await next();
  } catch {
    return c.json({ success: false, message: 'رمز غير صالح أو منتهي الصلاحية' }, 401);
  }
};

export const schoolAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const token = getCookie(c, 'access_token') || getTokenFromHeader(c);
  if (!token) return c.json({ success: false, message: 'غير مصرح' }, 401);
  try {
    const payload = await verifyAccessToken(token);
    if (payload.role !== 'school') return c.json({ success: false, message: 'مطلوب صلاحية مدرسة' }, 403);
    const school = await getSchoolById(Number(payload.sub));
    if (!school) return c.json({ success: false, message: 'المدرسة غير موجودة' }, 401);
    if (!school.is_active) return c.json({ success: false, message: 'حساب المدرسة معطل' }, 403);
    c.set('school', school);
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
    const admin = await db.get<{ id: number; name: string; email: string; blocked_at: string | null }>(
      'SELECT id, name, email, blocked_at FROM users WHERE id = ?', Number(payload.sub),
    );
    if (!admin) return c.json({ success: false, message: 'الأدمن غير موجود' }, 401);
    if (admin.blocked_at) return c.json({ success: false, message: 'الحساب محظور' }, 403);
    c.set('user', { id: admin.id, name: admin.name, email: admin.email, role: 'admin' } as User);
    await next();
  } catch {
    return c.json({ success: false, message: 'رمز غير صالح أو منتهي الصلاحية' }, 401);
  }
};
