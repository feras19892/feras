import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema } from './schemas.js';
import { login, register, refreshAccessToken, logout, getUserById, updatePassword } from './services.js';
import { setRefreshCookie, getRefreshCookie, clearRefreshCookie } from './cookies.js';
import { verifyAccessToken } from './jwt.js';
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
    } catch {
      // ignore invalid token on logout
    }
  }
  clearRefreshCookie(c);
  return c.json({ success: true });
});

authRoutes.get('/me', async (c) => {
  const auth = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!auth) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }
  try {
    const payload = await verifyAccessToken(auth);
    const user = await getUserById(Number(payload.sub));
    if (!user) {
      return c.json({ success: false, message: 'User not found' }, 401);
    }
    return c.json({ success: true, user });
  } catch {
    return c.json({ success: false, message: 'Invalid token' }, 401);
  }
});

authRoutes.patch('/password', async (c) => {
  const auth = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!auth) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }
  try {
    const payload = await verifyAccessToken(auth);
    const body = await c.req.json();
    const userId = Number(body.user_id);
    if (Number(payload.sub) !== userId && payload.role !== 'admin') {
      return c.json({ success: false, message: 'Forbidden' }, 403);
    }
    const ok = await updatePassword(userId, body.new_password);
    if (!ok) return c.json({ success: false, message: 'Update failed' }, 500);
    return c.json({ success: true });
  } catch {
    return c.json({ success: false, message: 'Invalid token' }, 401);
  }
});

export { authRoutes };
