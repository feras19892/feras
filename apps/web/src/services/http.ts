export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? '';
}

export function apiUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
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

export async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const mergedHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ? normalizeHeaders(options.headers) : {}),
  };

  let response = await fetch(apiUrl(path), {
    ...options,
    headers: mergedHeaders,
    credentials: 'include',
  });

  if (response.status === 401) {
    try {
      const refreshRes = await fetch(apiUrl('/api/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        // Server set a new access_token cookie; retry original request
        response = await fetch(apiUrl(path), {
          ...options,
          headers: mergedHeaders,
          credentials: 'include',
        });
      }
    } catch {
      // ignore refresh failure; the response below will remain 401
    }
  }

  if (!response.ok) {
    if (response.status === 404) {
      return { success: false, message: 'API not available' } as unknown as T;
    }
    let msg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body && body.message) msg = body.message;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return (await response.json()) as T;
}
