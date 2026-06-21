export const API_BASE_URL: string = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL) || 'http://localhost:3000';

export function apiUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export interface FetchOptions extends RequestInit {
  signal?: AbortSignal;
}

const TOKEN_KEY = 'access-token';

function loadToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

let accessToken: string | null = loadToken();

export function setAccessToken(token: string | null) {
  accessToken = token;
  try { if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

export function getAccessToken(): string | null {
  return accessToken;
}

export async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const mergedHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
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
        const refreshData = await refreshRes.json();
        if (refreshData.token) {
          setAccessToken(refreshData.token);
          mergedHeaders.Authorization = `Bearer ${accessToken}`;
          response = await fetch(apiUrl(path), {
            ...options,
            headers: mergedHeaders,
            credentials: 'include',
          });
        }
      } else {
        setAccessToken(null);
      }
    } catch {
      setAccessToken(null);
    }
  }

  if (!response.ok) {
    let msg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body && body.message) msg = body.message;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return (await response.json()) as T;
}
