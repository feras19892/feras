export const API_BASE_URL: string = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL) || 'http://localhost:3000';

export function apiUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export interface FetchOptions extends RequestInit {
  signal?: AbortSignal;
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
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
          accessToken = refreshData.token;
          mergedHeaders.Authorization = `Bearer ${accessToken}`;
          response = await fetch(apiUrl(path), {
            ...options,
            headers: mergedHeaders,
            credentials: 'include',
          });
        }
      } else {
        accessToken = null;
      }
    } catch {
      accessToken = null;
    }
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}
