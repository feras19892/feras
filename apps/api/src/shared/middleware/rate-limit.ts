import { rateLimiter } from 'hono-rate-limiter';
import type { Context, MiddlewareHandler } from 'hono';

const isDev = process.env.NODE_ENV !== 'production';
const TRUSTED_PROXIES = (process.env.TRUSTED_PROXIES || (isDev ? '127.0.0.1,::1' : ''))
  .split(',').map((s) => s.trim()).filter(Boolean);

function isTrustedProxy(ip: string): boolean {
  return TRUSTED_PROXIES.includes(ip);
}

function getClientIp(c: Context): string {
  const remoteIp = c.req.header('x-real-ip') || c.req.header('x-client-ip') || 'unknown';
  if (isTrustedProxy(remoteIp) || isDev) {
    const raw = c.req.header('x-forwarded-for');
    if (raw) {
      const first = raw.split(',')[0].trim();
      if (first) return first;
    }
    return c.req.header('x-real-ip')
      || c.req.header('x-client-ip')
      || 'unknown';
  }
  return remoteIp;
}

function userKey(c: Context): string {
  const user = c.get('user');
  if (user?.id) return `user-${user.id}`;
  return getClientIp(c);
}

function skipGet(limiter: MiddlewareHandler): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.method === 'GET') return next();
    return limiter(c, next);
  };
}

export const loginRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 1000 : 200,
  standardHeaders: 'draft-6',
  keyGenerator: getClientIp,
});

export const registerRateLimit = rateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: isDev ? 1000 : 3,
  standardHeaders: 'draft-6',
  keyGenerator: getClientIp,
});

export const passwordUpdateRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 1000 : 3,
  standardHeaders: 'draft-6',
  keyGenerator: getClientIp,
});

export const aiRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: isDev ? 100 : 10,
  standardHeaders: 'draft-6',
  keyGenerator: userKey,
});

export const chatRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: isDev ? 200 : 30,
  standardHeaders: 'draft-6',
  keyGenerator: userKey,
});

export const passwordResetRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 1000 : 5,
  standardHeaders: 'draft-6',
  keyGenerator: getClientIp,
});

export const verifyEmailRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 1000 : 10,
  standardHeaders: 'draft-6',
  keyGenerator: getClientIp,
});

export const writeRateLimit = skipGet(rateLimiter({
  windowMs: 60 * 1000,
  limit: isDev ? 500 : 200,
  standardHeaders: 'draft-6',
  keyGenerator: userKey,
}));

export const adminRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: isDev ? 500 : 60,
  standardHeaders: 'draft-6',
  keyGenerator: userKey,
});

export const globalRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: isDev ? 5000 : 1000,
  standardHeaders: 'draft-6',
  keyGenerator: getClientIp,
});
