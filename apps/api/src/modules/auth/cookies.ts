import { deleteCookie, setCookie, getCookie } from 'hono/cookie';
import type { Context } from 'hono';

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTS = {
  path: '/',
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'Strict' as const : 'Lax' as const,
  maxAge: 7 * 24 * 60 * 60,
};

export function setRefreshCookie(c: Context, token: string) {
  setCookie(c, 'refresh_token', token, COOKIE_OPTS);
}

export function getRefreshCookie(c: Context): string | undefined {
  return getCookie(c, 'refresh_token');
}

export function clearRefreshCookie(c: Context) {
  deleteCookie(c, 'refresh_token', COOKIE_OPTS);
}
