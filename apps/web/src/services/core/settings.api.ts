import { fetchJson } from '../http'

export function getSystemSettings() {
  return fetchJson<{ success: boolean; data: Record<string, string | boolean | number> }>('/api/settings')
}

export function updateSystemSetting(key: string, value: string) {
  return fetchJson<{ success: boolean; value: string }>(`/api/settings/${key}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
}
