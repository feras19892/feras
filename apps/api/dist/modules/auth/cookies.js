import { deleteCookie, setCookie, getCookie } from 'hono/cookie';
const isProd = process.env.NODE_ENV === 'production';
const REFRESH_COOKIE_OPTS = {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'Strict' : 'Lax',
    maxAge: 7 * 24 * 60 * 60,
};
const ACCESS_COOKIE_OPTS = {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'Strict' : 'Lax',
    maxAge: 15 * 60,
};
export function setRefreshCookie(c, token) {
    setCookie(c, 'refresh_token', token, REFRESH_COOKIE_OPTS);
}
export function getRefreshCookie(c) {
    return getCookie(c, 'refresh_token');
}
export function clearRefreshCookie(c) {
    deleteCookie(c, 'refresh_token', REFRESH_COOKIE_OPTS);
}
export function setAccessCookie(c, token) {
    setCookie(c, 'access_token', token, ACCESS_COOKIE_OPTS);
}
export function getAccessCookie(c) {
    return getCookie(c, 'access_token');
}
export function clearAccessCookie(c) {
    deleteCookie(c, 'access_token', ACCESS_COOKIE_OPTS);
}
