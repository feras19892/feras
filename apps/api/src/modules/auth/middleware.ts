import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyAccessToken } from './jwt.js';
import { getUserById } from './services.js';
import { db } from '../../db/index.js';
import type { User } from '@my-modern-app/shared-types';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const accessToken = getCookie(c, 'access_token');
  if (!accessToken) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }
  try {
    const payload = await verifyAccessToken(accessToken);

    // School role: fetch from schools table
    if (payload.role === 'school') {
      const school = await db.get<{ id: number; email: string; name: string }>(
        'SELECT id, email, name FROM schools WHERE id = ?', Number(payload.sub)
      );
      if (!school) {
        return c.json({ success: false, message: 'School not found' }, 401);
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
      return c.json({ success: false, message: 'User not found' }, 401);
    }
    c.set('user', user);
    await next();
  } catch {
    return c.json({ success: false, message: 'Invalid or expired token' }, 401);
  }
};
