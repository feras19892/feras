import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter((s) => s !== '*')
  : ['http://localhost:5173', 'http://localhost:3000', 'https://feras-taupe.vercel.app', 'https://dist-eight-nu-90.vercel.app'];

if (allowedOrigins.length === 0) {
  console.warn('[cors] No valid CORS origins configured — defaulting to localhost');
  allowedOrigins.push('http://localhost:5173');
}

export const corsMiddleware: MiddlewareHandler = cors({
  origin: (origin) => {
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true,
  maxAge: 86400,
});
