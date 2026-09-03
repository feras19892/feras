import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

const LOCAL_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const isDev = process.env.NODE_ENV !== 'production';

// In development allow local + common tunnel domains; in production use only explicit CORS_ORIGIN.
const dynamicOriginPatterns = isDev
  ? ['.ngrok-free.dev', '.ngrok.io', '.trycloudflare.com', '.loca.lt', '.serveousercontent.com']
  : [];

// Production allows ONLY the exact origins listed in CORS_ORIGIN (e.g. your live Vercel domain).
function getProductionOrigins(): string[] {
  return process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim().toLowerCase()).filter((s) => s !== '*' && s !== '')
    : [];
}

/**
 * Strict origin check.
 * - Production: only exact origins configured via CORS_ORIGIN are accepted.
 * - Development: also accepts localhost origins and common tunnel domains for convenience.
 */
export function isAllowedOrigin(origin: string): boolean {
  if (!origin || origin === 'null') return false;
  const normalized = origin.toLowerCase();

  if (!isDev) {
    return getProductionOrigins().includes(normalized);
  }

  if (LOCAL_ORIGINS.includes(normalized) || getProductionOrigins().includes(normalized)) return true;
  return dynamicOriginPatterns.some((p) => normalized.endsWith(p));
}

export const corsMiddleware: MiddlewareHandler = cors({
  origin: (origin, c) => {
    if (!origin) return null;
    if (isAllowedOrigin(origin)) {
      return origin;
    }
    // رفض صريح بدلاً من null صامت — تسهيل التصحيح
    if (isDev) {
      console.warn(`[cors] Origin rejected: ${origin}`);
    }
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Cache-Control', 'Accept'],
  credentials: true,
  maxAge: 86400,
});

/**
 * Startup check — production fails closed already (empty CORS_ORIGIN rejects
 * every cross-origin browser request), but make the misconfiguration loud and
 * obvious in the server logs so it is caught on first deploy.
 * Call once from the API entrypoint.
 */
export function warnIfCorsMisconfigured(): void {
  if (isDev) return;
  if (getProductionOrigins().length === 0) {
    console.warn(
      '[cors] CORS_ORIGIN is NOT set — in production every cross-origin browser request will be rejected. ' +
      'Set it to your live frontend domain only, e.g. CORS_ORIGIN=https://your-app.vercel.app'
    );
  }
}
