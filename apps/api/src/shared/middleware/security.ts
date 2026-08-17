import type { MiddlewareHandler } from 'hono';

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next();

  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  if (process.env.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    c.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'");
  }
};
