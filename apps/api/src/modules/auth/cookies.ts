import { deleteCookie, setCookie, getCookie } from 'hono/cookie';
import type { Context } from 'hono';

const isProd = process.env.NODE_ENV === 'production';
const crossOrigin = isProd && !!process.env.CORS_ORIGIN;

const REFRESH_COOKIE_OPTS = {
  path: '/',
  httpOnly: true,
  secure: isProd || crossOrigin,
  sameSite: (crossOrigin ? 'None' : 'Lax') as 'None' | 'Lax',
  maxAge: 7 * 24 * 60 * 60,
};

const ACCESS_COOKIE_OPTS = {
  path: '/',
  httpOnly: true,
  secure: isProd || crossOrigin,
  sameSite: (crossOrigin ? 'None' : 'Lax') as 'None' | 'Lax',
  maxAge: 15 * 60,
};

export function setRefreshCookie(c: Context, token: string) {
  setCookie(c, 'refresh_token', token, REFRESH_COOKIE_OPTS);
}

export function getRefreshCookie(c: Context): string | undefined {
  return getCookie(c, 'refresh_token');
}

export function clearRefreshCookie(c: Context) {
  deleteCookie(c, 'refresh_token', REFRESH_COOKIE_OPTS);
}

export function setAccessCookie(c: Context, token: string) {
  setCookie(c, 'access_token', token, ACCESS_COOKIE_OPTS);
}

export function getAccessCookie(c: Context): string | undefined {
  return getCookie(c, 'access_token');
}

export function clearAccessCookie(c: Context) {
  deleteCookie(c, 'access_token', ACCESS_COOKIE_OPTS);
}
