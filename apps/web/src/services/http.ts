export function getApiBaseUrl(): string {
  const env = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
  return env.trim() ? env : 'http://localhost:3000'
}

export function apiUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access?: string, _refresh?: string) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
  // أمان (#3): refresh token لم يعد يُخزَّن في localStorage — يعيش فقط في كوكي
  // HttpOnly يضبطها الـ API (7 أيام + تدوير عند كل تحديث). الجلسات القديمة التي
  // تحتوي refresh محفوظ سابقاً تستمر بالعمل عبر getRefreshToken() حتى الدخول القادم.
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export interface FetchOptions extends RequestInit {
  signal?: AbortSignal;
}

/** Normalize RequestInit headers into a plain Record for merging */
function normalizeHeaders(headers: RequestInit['headers']): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => { result[key] = value; });
    return result;
  }
  if (Array.isArray(headers)) {
    const result: Record<string, string> = {};
    for (const [key, value] of headers) { result[key] = value; }
    return result;
  }
  return headers as Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type ApiResult<T> = T & { success?: boolean; message?: string };

let refreshPromise: Promise<boolean> | null = null;

async function singleFlightRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const refreshTok = getRefreshToken();
      const refreshHeaders: Record<string, string> = {
        'ngrok-skip-browser-warning': 'true',
      };
      if (refreshTok) refreshHeaders['Authorization'] = `Bearer ${refreshTok}`;
      const refreshRes = await fetch(apiUrl('/api/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: refreshHeaders,
        signal: AbortSignal.timeout(10_000),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.accessToken) setTokens(data.accessToken, data.refreshToken);
      }
      return refreshRes.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const mergedHeaders: Record<string, string> = {
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers ? normalizeHeaders(options.headers) : {}),
  };

  const accessToken = getAccessToken();
  if (accessToken && !mergedHeaders['Authorization']) {
    mergedHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const fetchOpts: RequestInit = {
    ...options,
    headers: mergedHeaders,
    credentials: 'include',
  };

  if (!options.signal && !options.body) {
    fetchOpts.signal = AbortSignal.timeout(30_000);
  }

  let response = await fetch(apiUrl(path), fetchOpts);

  if (response.status === 401) {
    if (path.includes('/auth/login') || path.includes('/auth/register')) {
      // Pass through: let the caller see the actual 401 response body
    } else {
      const refreshed = await singleFlightRefresh();
      if (refreshed) {
        const newAccessToken = getAccessToken();
        const retryHeaders: Record<string, string> = {
          ...mergedHeaders,
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        };
        if (newAccessToken) {
          retryHeaders['Authorization'] = `Bearer ${newAccessToken}`;
        }
        const retryOpts: FetchOptions = { ...options, headers: retryHeaders, credentials: 'include' };
        if (options.body) {
          if (typeof options.body === 'string' || options.body instanceof FormData || options.body instanceof Blob) {
            retryOpts.body = options.body;
          } else {
            retryOpts.body = JSON.stringify(options.body);
          }
        }
        response = await fetch(apiUrl(path), retryOpts);
        if (response.status === 401) {
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          return { success: false, message: 'Session expired' } as T;
        }
      } else {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return { success: false, message: 'Session expired' } as T;
      }
    }
  }

  if (!response.ok) {
    if (response.status === 429) {
      const body = await response.json().catch(() => null);
      const limitMsg = body?.message || 'تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.';
      throw new ApiError(limitMsg, 429);
    }
    if (response.status === 403) {
      const body = await response.json().catch(() => null);
      if (body?.blocked || body?.message?.includes('معاقب') || body?.message?.includes('مجمد') || body?.message?.includes('محظور')) {
        window.dispatchEvent(new CustomEvent('auth:blocked', { detail: body }));
        return { success: false, message: body?.message || 'تم تجميد حسابك', blocked: true } as T;
      }
      return { success: false, message: body?.message || 'غير مصرح' } as T;
    }
    if (response.status === 404) {
      const body = await response.json().catch(() => null);
      return { success: false, message: body?.message || 'Resource not found' } as T;
    }
    let msg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body && body.message) msg = body.message;
      if (body && typeof body.success === 'boolean') {
        return body as T;
      }
    } catch { if (import.meta.env.DEV) console.warn('Failed to parse error response body') }
    throw new ApiError(msg, response.status);
  }
  return (await response.json()) as T;
}
