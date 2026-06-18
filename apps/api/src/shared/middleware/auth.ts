import type { MiddlewareHandler } from 'hono';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }
  // TODO: verify JWT token
  await next();
};
