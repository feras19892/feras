import { fetchJson } from '../http'

export interface NotificationTemplate {
  id: number
  key: string
  role: string
  event: 'trial_ends' | 'yearly_renewal' | 'payment_due'
  days_before: number
  hour: number
  minute: number
  is_active: number
  channel: string
  ar_title: string
  ar_body: string
  en_title: string
  en_body: string
  es_title: string
  es_body: string
  created_at: string
  updated_at: string
}

export interface NotificationTemplateInput {
  key: string
  role: string
  event: 'trial_ends' | 'yearly_renewal' | 'payment_due'
  days_before: number
  hour: number
  minute: number
  is_active?: number
  ar_title: string
  ar_body: string
  en_title: string
  en_body: string
  es_title: string
  es_body: string
}

export function getNotificationTemplates(params?: {
  event?: string
  role?: string
  is_active?: string
  sort?: string
  order?: string
}) {
  const q = new URLSearchParams()
  if (params?.event) q.set('event', params.event)
  if (params?.role) q.set('role', params.role)
  if (params?.is_active) q.set('is_active', params.is_active)
  if (params?.sort) q.set('sort', params.sort)
  if (params?.order) q.set('order', params.order)
  const qs = q.toString()
  return fetchJson<{ success: boolean; templates: NotificationTemplate[] }>(`/api/admin/notification-templates${qs ? '?' + qs : ''}`)
}

export function createNotificationTemplate(data: NotificationTemplateInput) {
  return fetchJson<{ success: boolean; id: number }>('/api/admin/notification-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function deleteNotificationTemplate(id: number) {
  return fetchJson<{ success: boolean }>(`/api/admin/notification-templates/${id}`, { method: 'DELETE' })
}

export function runNotificationScheduler() {
  return fetchJson<{ success: boolean; message: string }>('/api/admin/notification-templates/run', { method: 'POST' })
}
