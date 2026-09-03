import { fetchJson } from './http'

export interface UserWarning {
  id: number
  admin_id: number
  user_id: number
  school_id: number
  title: string
  message: string
  severity: string
  is_read: number
  read_at: string | null
  created_at: string
  admin_issuer_name?: string
  school_issuer_name?: string
}

export function getMyWarnings() {
  return fetchJson<{ success: boolean; warnings: UserWarning[]; unreadCount: number }>('/api/enh/my-warnings')
}

export function markWarningRead(id: number) {
  return fetchJson<{ success: boolean }>(`/api/enh/my-warnings/${id}/read`, { method: 'PATCH' })
}

export function markAllWarningsRead() {
  return fetchJson<{ success: boolean }>('/api/enh/my-warnings/read-all', { method: 'PATCH' })
}
