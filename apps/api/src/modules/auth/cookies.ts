import { deleteCookie, setCookie, getCookie } from 'hono/cookie';
import type { Context } from 'hono';

const isProd = process.env.NODE_ENV === 'production';
const crossOrigin = isProd && !!process.env.CORS_ORIGIN;

// Detect whether this specific request is cross-site. Browsers send
// `Sec-Fetch-Site: cross-site`; fall back to comparing Origin against the
// request host. This lets a dev/tunneled API (e.g. ngrok) still issue
// SameSite=None cookies to a deployed frontend.
function isCrossSiteRequest(c: Context): boolean {
  const sfs = c.req.header('sec-fetch-site');
  if (sfs) return sfs === 'cross-site';
  const origin = c.req.header('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(c.req.url).host;
  } catch {
    return false;
  }
}

function cookieOpts(c: Context, maxAge: number) {
  const cross = crossOrigin || isCrossSiteRequest(c);
  return {
    path: '/',
    httpOnly: true,
    secure: isProd || cross,
    sameSite: (cross ? 'None' : 'Lax') as 'None' | 'Lax',
    maxAge,
  };
}

export function setRefreshCookie(c: Context, token: string) {
  setCookie(c, 'refresh_token', token, cookieOpts(c, 7 * 24 * 60 * 60));
}

export function getRefreshCookie(c: Context): string | undefined {
  return getCookie(c, 'refresh_token');
}

export function clearRefreshCookie(c: Context) {
  deleteCookie(c, 'refresh_token', cookieOpts(c, 7 * 24 * 60 * 60));
}

export function setAccessCookie(c: Context, token: string) {
  setCookie(c, 'access_token', token, cookieOpts(c, 15 * 60));
}

export function getAccessCookie(c: Context): string | undefined {
  return getCookie(c, 'access_token');
}

export function clearAccessCookie(c: Context) {
  deleteCookie(c, 'access_token', cookieOpts(c, 15 * 60));
}
