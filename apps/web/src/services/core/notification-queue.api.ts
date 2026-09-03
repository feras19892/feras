import { fetchJson } from '../http'

export interface QueueRecord {
  id: number
  user_id: number | null
  school_id: number | null
  owner_id: number | null
  owner_type: string | null
  event: string
  event_date: string
  scheduled_at: string
  title: string
  message: string
  lang: string
  channel: string
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  attempts: number
  sent_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationUser {
  id: number
  name: string
  email: string
  role: string
  subscription_status: string | null
  plan_name: string | null
  expires_at: string | null
  pending_count: number
  sent_count: number
  last_title: string | null
  last_status: string | null
  last_scheduled: string | null
}

export interface NotificationOwner {
  owner_id: number
  owner_type: 'user' | 'school'
  name: string
  email: string
  role: string
  subscription_status: string | null
  plan_name: string | null
  expires_at: string | null
  pending_count: number
  sent_count: number
  last_title: string | null
  last_status: string | null
  last_scheduled: string | null
}

export interface QueueListResponse {
  success: boolean
  queue: QueueRecord[]
  total: number
}

export interface UserNotification {
  id: number
  type: string
  title: string
  message: string
  is_read: number
  created_at: string
}

export function getUserNotifications(userId: number) {
  return fetchJson<{ success: boolean; notifications: UserNotification[]; queue: QueueRecord[] }>(`/api/admin/notification-queue/users/${userId}/notifications`)
}

export function getOwnerNotifications(ownerType: string, ownerId: number) {
  return fetchJson<{ success: boolean; notifications: UserNotification[]; queue: QueueRecord[] }>(`/api/admin/notification-queue/owners/${ownerType}/${ownerId}/notifications`)
}

export function getNotificationUsers(params?: {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
}) {
  const q = new URLSearchParams()
  if (params?.search) q.set('search', params.search)
  if (params?.role) q.set('role', params.role)
  if (params?.status) q.set('status', params.status)
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  const qs = q.toString()
  return fetchJson<{ success: boolean; users: NotificationUser[]; total: number }>(`/api/admin/notification-queue/users${qs ? '?' + qs : ''}`)
}

export function getNotificationOwners(params?: {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
}) {
  const q = new URLSearchParams()
  if (params?.search) q.set('search', params.search)
  if (params?.role) q.set('role', params.role)
  if (params?.status) q.set('status', params.status)
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  const qs = q.toString()
  return fetchJson<{ success: boolean; owners: NotificationOwner[]; total: number }>(`/api/admin/notification-queue/owners${qs ? '?' + qs : ''}`)
}

export function getNotificationQueue(params?: {
  status?: string
  event?: string
  user_id?: string
  sort?: string
  order?: string
  page?: number
  limit?: number
}) {
  const q = new URLSearchParams()
  if (params?.status) q.set('status', params.status)
  if (params?.event) q.set('event', params.event)
  if (params?.user_id) q.set('user_id', params.user_id)
  if (params?.sort) q.set('sort', params.sort)
  if (params?.order) q.set('order', params.order)
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  const qs = q.toString()
  return fetchJson<QueueListResponse>(`/api/admin/notification-queue${qs ? '?' + qs : ''}`)
}

export function sendNotificationQueueItem(id: number) {
  return fetchJson<{ success: boolean }>(`/api/admin/notification-queue/${id}/send`, { method: 'POST' })
}

export function updateNotificationQueueItem(id: number, data: Partial<Pick<QueueRecord, 'title' | 'message' | 'scheduled_at' | 'channel'>>) {
  return fetchJson<{ success: boolean }>(`/api/admin/notification-queue/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function deleteNotificationQueueItem(id: number) {
  return fetchJson<{ success: boolean }>(`/api/admin/notification-queue/${id}`, { method: 'DELETE' })
}
