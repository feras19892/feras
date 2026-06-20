import { rateLimiter } from 'hono-rate-limiter';
import type { Context } from 'hono';

const isDev = process.env.NODE_ENV !== 'production';

export const loginRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: isDev ? 1000 : 5,
  standardHeaders: 'draft-6',
  keyGenerator: (c: Context) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || c.req.header('x-client-ip');
    return ip || 'unknown';
  },
});
