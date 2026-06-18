export const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

export function apiUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export interface FetchOptions extends RequestInit {
  signal?: AbortSignal;
}

export async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const mergedHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) ?? {}),
  };
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: mergedHeaders,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}
