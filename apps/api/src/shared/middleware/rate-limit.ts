import { rateLimiter } from 'hono-rate-limiter';
import type { Context, MiddlewareHandler } from 'hono';

const isDev = process.env.NODE_ENV !== 'production';

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const p of parts) {
    const byte = Number(p);
    if (!Number.isInteger(byte) || byte < 0 || byte > 255) return null;
    result = (result << 8) | byte;
  }
  return result >>> 0;
}

function isTrustedProxy(ip: string): boolean {
  const entries = (process.env.TRUSTED_PROXIES || '')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (entries.length === 0) return false;

  const ipInt = ipv4ToInt(ip);
  for (const entry of entries) {
    if (entry === ip.toLowerCase()) return true;
    if (!entry.includes('/') || ipInt === null) continue;
    const [netPart, bitsPart] = entry.split('/');
    const bits = Number(bitsPart);
    const netInt = ipv4ToInt(netPart);
    if (netInt === null || !Number.isInteger(bits) || bits < 0 || bits > 32) continue;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    if ((ipInt & mask) === (netInt & mask)) return true;
  }
  return false;
}

/**
 * Resolves the client IP used for rate limiting.
 * - Development: keeps the first X-Forwarded-For entry (tunnels / ngrok).
 * - Production WITHOUT TRUSTED_PROXIES (typical single-edge hosting such as
 *   Vercel/Render): uses the LAST X-Forwarded-For entry, which the edge appends
 *   AFTER any client-supplied value, so spoofed leading IPs cannot keep the
 *   attacker off the shared bucket and bypass the limiter.
 * - Production WITH TRUSTED_PROXIES: walks X-Forwarded-For from the right,
 *   skipping trusted proxy addresses/CIDRs, and returns the first untrusted one.
 */
function getClientIp(c: Context): string {
  const xff = c.req.header('x-forwarded-for');
  const realIp = c.req.header('x-real-ip');
  const clientIp = c.req.header('x-client-ip');
  const xffParts = xff ? xff.split(',').map((s) => s.trim()).filter(Boolean) : [];

  if (isDev) {
    if (xffParts.length > 0) return xffParts[0];
    return realIp || clientIp || 'unknown';
  }

  const trustedList = (process.env.TRUSTED_PROXIES || '')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

  if (trustedList.length === 0) {
    if (xffParts.length > 0) return xffParts[xffParts.length - 1] || 'unknown';
    return realIp || clientIp || 'unknown';
  }

  for (let i = xffParts.length - 1; i >= 0; i--) {
    if (!isTrustedProxy(xffParts[i])) return xffParts[i];
  }
  if (xffParts.length > 0) return xffParts[0];
  return realIp || clientIp || 'unknown';
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
  limit: isDev ? 1000 : 20,
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
