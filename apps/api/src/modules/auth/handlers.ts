import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema } from './schemas.js';
import { login, register, refreshAccessToken, logout, updatePassword } from './services.js';
import * as activitySvc from '../admin/activity-service.js';
import * as sessionSvc from '../admin/session-service.js';
import { setRefreshCookie, getRefreshCookie, clearRefreshCookie } from './cookies.js';
import { verifyAccessToken } from './jwt.js';
import { authMiddleware } from '../../shared/middleware/auth.js';
import type { User } from '@my-modern-app/shared-types';

const authRoutes = new Hono();

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json');
  const result = await register(body);
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 409);
  }
  return c.json({ success: true, user: result.user }, 201);
});

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json');
  const result = await login(body.email, body.password);
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 401);
  }
  if (result.refreshToken) {
    setRefreshCookie(c, result.refreshToken);
  }
  // Log activity + session
  if (result.user) {
    await sessionSvc.logLogin(result.user.id, c.req.header('X-Forwarded-For') || c.req.header('x-real-ip') || 'unknown', c.req.header('user-agent'));
    await activitySvc.logActivity(result.user.id, result.user.name, result.user.role, 'login');
  }
  return c.json({ success: true, user: result.user, token: result.token });
});

authRoutes.post('/refresh', async (c) => {
  const refreshToken = getRefreshCookie(c);
  if (!refreshToken) {
    return c.json({ success: false, message: 'No refresh token' }, 401);
  }
  const result = await refreshAccessToken(refreshToken);
  if (!result.success) {
    clearRefreshCookie(c);
    return c.json({ success: false, message: result.message }, 401);
  }
  return c.json({ success: true, token: result.token });
});

authRoutes.post('/logout', async (c) => {
  const auth = c.req.header('Authorization')?.replace('Bearer ', '');
  if (auth) {
    try {
      const payload = await verifyAccessToken(auth);
      await logout(Number(payload.sub));
      await sessionSvc.logLogout(Number(payload.sub));
      await activitySvc.logActivity(Number(payload.sub), '', '', 'logout');
    } catch {
      // ignore invalid token on logout
    }
  }
  clearRefreshCookie(c);
  return c.json({ success: true });
});

authRoutes.get('/me', authMiddleware, async (c) => {
  const user = (c as any).get('user') as User;
  return c.json({ success: true, user });
});

authRoutes.patch('/password', authMiddleware, async (c) => {
  const user = (c as any).get('user') as User;
  const body = await c.req.json();
  const userId = Number(body.user_id);
  if (user.id !== userId && user.role !== 'admin') {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }
  const ok = await updatePassword(userId, body.new_password);
  if (!ok) return c.json({ success: false, message: 'Update failed' }, 500);
  return c.json({ success: true });
});

export { authRoutes };
