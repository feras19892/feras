import type { MiddlewareHandler } from 'hono';

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next();

  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  c.header('X-Robots-Tag', 'noindex, nofollow');
  c.header('Cross-Origin-Resource-Policy', 'same-origin');

  if (process.env.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    c.header(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval'",          // Vue needs eval for dev; keep for prod SFC render
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https: wss:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );
  }
};
