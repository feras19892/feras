import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema, passwordUpdateSchema, profileUpdateSchema, deleteAccountSchema, nameRequestSchema, verifyEmailSchema } from './schemas.js';
import { login, register, refreshAccessToken, logout, updatePassword, updateProfileName, deleteAccount, createNameRequest, verifyEmailCode } from './services.js';
import * as activitySvc from '../activity/service.js';
import * as sessionSvc from '../sessions/service.js';
import { setRefreshCookie, getRefreshCookie, clearRefreshCookie, setAccessCookie, getAccessCookie, clearAccessCookie } from './cookies.js';
import { verifyAccessToken } from './jwt.js';
import { authMiddleware } from './middleware.js';
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
  if (result.token) {
    setAccessCookie(c, result.token);
  }
  if (result.refreshToken) {
    setRefreshCookie(c, result.refreshToken);
  }
  // Log activity + session
  if (result.user) {
    await sessionSvc.logLogin(result.user.id, c.req.header('X-Forwarded-For') || c.req.header('x-real-ip') || 'unknown', c.req.header('user-agent'));
    await activitySvc.logActivity(result.user.id, result.user.name, result.user.role, 'login');
  }
  return c.json({ success: true, user: result.user });
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
  if (result.token) {
    setAccessCookie(c, result.token);
  }
  if (result.refreshToken) {
    setRefreshCookie(c, result.refreshToken);
  }
  return c.json({ success: true });
});

authRoutes.post('/logout', async (c) => {
  const accessToken = getAccessCookie(c);
  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);
      await logout(Number(payload.sub));
      await sessionSvc.logLogout(Number(payload.sub));
      await activitySvc.logActivity(Number(payload.sub), '', '', 'logout');
    } catch {
      // ignore invalid token on logout
    }
  }
  clearAccessCookie(c);
  clearRefreshCookie(c);
  return c.json({ success: true });
});

authRoutes.get('/me', authMiddleware, async (c) => {
  const user = (c as any).get('user') as User;
  return c.json({ success: true, user });
});

authRoutes.post('/verify-email', zValidator('json', verifyEmailSchema), async (c) => {
  const body = c.req.valid('json');
  const result = await verifyEmailCode(body.email, body.code);
  if (!result.success) {
    return c.json({ success: false, message: result.message || 'Invalid code' }, 400);
  }
  if (result.token) {
    setAccessCookie(c, result.token);
  }
  if (result.refreshToken) {
    setRefreshCookie(c, result.refreshToken);
  }
  return c.json({ success: true, user: result.user });
});

authRoutes.patch('/password', authMiddleware, zValidator('json', passwordUpdateSchema), async (c) => {
  const user = (c as any).get('user') as User;
  const body = c.req.valid('json');
  const userId = body.user_id;
  if (user.id !== userId && user.role !== 'admin') {
    return c.json({ success: false, message: 'Forbidden' }, 403);
  }
  const ok = await updatePassword(userId, body.new_password);
  if (!ok) return c.json({ success: false, message: 'Update failed' }, 500);
  return c.json({ success: true });
});

authRoutes.patch('/profile', authMiddleware, zValidator('json', profileUpdateSchema), async (c) => {
  const user = (c as any).get('user') as User;
  const body = c.req.valid('json');
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return c.json({ success: false, message: 'Only teachers can directly update name' }, 403);
  }
  const result = await updateProfileName(user.id, body.name);
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 400);
  }
  if (result.user) {
    await activitySvc.logActivity(result.user.id, result.user.name, result.user.role, 'update_profile');
  }
  return c.json({ success: true, user: result.user });
});

authRoutes.post('/name-request', authMiddleware, zValidator('json', nameRequestSchema), async (c) => {
  const user = (c as any).get('user') as User;
  const body = c.req.valid('json');
  const result = await createNameRequest(user.id, body.requested_name);
  if (!result.success) {
    return c.json({ success: false, message: result.message }, 400);
  }
  return c.json({ success: true });
});

authRoutes.delete('/account', authMiddleware, zValidator('json', deleteAccountSchema), async (c) => {
  const user = (c as any).get('user') as User;
  const body = c.req.valid('json');
  const result = await deleteAccount(user.id, body.password);
  if (!result.success) {
    const status = result.message === 'Invalid password' ? 403 : 400;
    return c.json({ success: false, message: result.message }, status);
  }
  await activitySvc.logActivity(user.id, user.name, user.role, 'delete_account');
  clearAccessCookie(c);
  clearRefreshCookie(c);
  return c.json({ success: true });
});

export { authRoutes };
