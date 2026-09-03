import { fetchJson } from '../http'

export interface AdminStats {
  users: { total: number; byRole: { role: string; count: number }[] }
  classes: { total: number }
  reports: { total: number; graded: number; pending: number; resubmitted: number; average: number }
  activity?: { today_logins: number; active_now: number; active_users_week: number; total_sessions: number }
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  created_at?: string
  email_verified_at?: string
  blocked_at?: string | null
  block_reason?: string | null
}

export interface AdminSchool {
  id: number
  name: string
  email: string
  code: string
  max_students: number
  max_teachers: number
  is_active: boolean
  created_at?: string
}

export interface AdminSystemHealth {
  counts: { users: number; classes: number; reports: number; sessions: number }
  today: { logins: number; signups: number; reports: number }
  dbSize: number
  tables: Record<string, number>
}

export function getStats() {
  return fetchJson<{ success: boolean; stats: AdminStats }>('/api/admin/stats')
}

export function getUsers(page = 1, limit = 50) {
  return fetchJson<{ success: boolean; users: AdminUser[]; total: number; page: number; limit: number }>(`/api/admin/users?page=${page}&limit=${limit}`)
}

export function getSchools() {
  return fetchJson<{ success: boolean; schools: AdminSchool[] }>('/api/admin/schools')
}

export function getSystemHealth() {
  return fetchJson<{ success: boolean; health: AdminSystemHealth }>('/api/admin/health')
}

export function getDetailedStats(period = 'all') {
  return fetchJson<{ success: boolean; stats: any }>(`/api/admin/detailed-stats?period=${period}`)
}

export function banUser(id: number, adminPassword: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${id}/ban`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: '', admin_password: adminPassword }),
  })
}

export function unbanUser(id: number, adminPassword: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${id}/unban`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_password: adminPassword }),
  })
}

export function deleteUser(id: number, adminPassword: string) {
  return fetchJson<{ success: boolean }>(`/api/admin/users/${id}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_password: adminPassword }),
  })
}

export function toggleSchoolActive(id: number, adminPassword: string) {
  return fetchJson<{ success: boolean }>(`/api/school/admin/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_password: adminPassword }),
  })
}

export function createSchool(name: string, code: string, maxStudents: number, maxTeachers: number) {
  return fetchJson<{ success: boolean; code?: string }>('/api/school/admin/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, code, max_students: maxStudents, max_teachers: maxTeachers }),
  })
}

export function deleteSchool(id: number, adminPassword: string) {
  return fetchJson<{ success: boolean }>(`/api/school/admin/${id}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_password: adminPassword }),
  })
}

export function updateSchool(id: number, data: { name?: string; max_students?: number; max_teachers?: number }, adminPassword: string) {
  return fetchJson<{ success: boolean }>(`/api/school/admin/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, admin_password: adminPassword }),
  })
}

export interface ApprovalRequest {
  id: number
  type: string
  status: string
  user_name: string
  user_email: string
  user_role: string
  created_at: string
  data?: Record<string, any>
}

export function getRequests(params?: { type?: string; status?: string; page?: number }) {
  const qs = params ? '?' + new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString() : ''
  return fetchJson<{ success: boolean; requests: ApprovalRequest[]; total: number }>(`/api/approvals${qs}`)
}

export function approveRequest(id: number) {
  return fetchJson<{ success: boolean; action?: string }>(`/api/approvals/admin/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response: '' }),
  })
}

export interface AdminPlan {
  id: number
  type: 'student' | 'teacher' | 'school'
  name: string
  currency: string
  features: string | null
  is_active: number
  created_at?: string
  updated_at?: string
  packages?: AdminPlanPackage[]
}

export interface AdminPlanTier {
  id?: number
  plan_id?: number
  applies_to: 'own' | 'student' | 'teacher'
  min_count: number
  max_count: number | null
  price_cents: number
  discount_percent: number
}

export function getAdminPlans() {
  return fetchJson<{ success: boolean; plans: AdminPlan[] }>('/api/admin/subscriptions/plans')
}

export function updateAdminPlan(id: number, data: Partial<AdminPlan>) {
  return fetchJson<{ success: boolean; plan?: AdminPlan }>(`/api/admin/subscriptions/plans/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function createAdminPlan(data: Omit<AdminPlan, 'id' | 'is_active' | 'created_at' | 'updated_at' | 'packages'>) {
  return fetchJson<{ success: boolean; plan?: AdminPlan }>('/api/admin/subscriptions/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export interface AdminPlanPackage {
  id?: number
  plan_id?: number
  teacher_count: number
  student_count: number
  price_cents_monthly: number
  price_cents_yearly: number
  currency: string
  stripe_product_id?: string | null
  stripe_price_id_monthly?: string | null
  stripe_price_id_yearly?: string | null
  archived_at?: string | null
  is_active?: number
}

export function getAdminPlanPackages(id: number) {
  return fetchJson<{ success: boolean; packages: AdminPlanPackage[] }>(`/api/admin/subscriptions/plans/${id}/packages`)
}

export function updateAdminPlanPackages(id: number, packages: AdminPlanPackage[]) {
  return fetchJson<{ success: boolean; packages: AdminPlanPackage[] }>(`/api/admin/subscriptions/plans/${id}/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packages }),
  })
}

export function deleteAdminPlanPackage(planId: number, pkgId: number) {
  return fetchJson<{ success: boolean }>(`/api/admin/subscriptions/plans/${planId}/packages/${pkgId}`, { method: 'DELETE' })
}

export function toggleAdminPlanPackage(planId: number, pkgId: number) {
  return fetchJson<{ success: boolean }>(`/api/admin/subscriptions/plans/${planId}/packages/${pkgId}/toggle`, { method: 'POST' })
}

export interface AdminActivationCode {
  id?: number
  code: string
  subscription_id?: number | null
  created_by_user_id: number
  used_by_user_id?: number | null
  status: 'active' | 'used' | 'revoked' | 'expired'
  expires_at?: string | null
}

export function toggleAdminPlan(id: number) {
  return fetchJson<{ success: boolean; plan?: AdminPlan }>(`/api/admin/subscriptions/plans/${id}/toggle`, {
    method: 'POST',
  })
}

export function rejectRequest(id: number, reason: string) {
  return fetchJson<{ success: boolean }>(`/api/approvals/admin/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response: reason }),
  })
}

export interface AdminSubscription {
  id: number
  owner_id: number
  owner_name?: string
  owner_email?: string
  owner_type: 'user' | 'school'
  plan_id: number
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'SUSPENDED'
  starts_at: string
  expires_at?: string | null
  next_billing_at?: string | null
  cancelled_at?: string | null
  created_at: string
  plan_name?: string
  plan_type?: 'student' | 'teacher' | 'school'
  price_cents?: number
  max_students?: number | null
  max_teachers?: number | null
}

export function getSubscriptions(params: { status?: string; owner_type?: string; search?: string; sort?: 'created_at' | 'expires_at' | 'price_cents'; order?: 'asc' | 'desc'; page?: number; limit?: number } = {}) {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  if (params.owner_type) q.set('owner_type', params.owner_type)
  if (params.search) q.set('search', params.search)
  if (params.sort) q.set('sort', params.sort)
  if (params.order) q.set('order', params.order)
  if (params.page != null) q.set('page', String(params.page))
  if (params.limit != null) q.set('limit', String(params.limit))
  const qs = q.toString()
  return fetchJson<{ success: boolean; subscriptions: AdminSubscription[] }>(`/api/subscriptions/admin/subscriptions${qs ? '?' + qs : ''}`)
}

export function updateSubscription(id: number, data: { status?: string; plan_id?: number | null; expires_at?: string | null; next_billing_at?: string | null; max_students?: number | null; max_teachers?: number | null }) {
  return fetchJson<{ success: boolean }>(`/api/subscriptions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function cancelSubscription(id: number) {
  return fetchJson<{ success: boolean }>(`/api/subscriptions/${id}/cancel`, { method: 'POST' })
}

export function createSubscription(data: {
  owner_id: number
  owner_type: 'user' | 'school'
  plan_id?: number | null
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'SUSPENDED'
  starts_at?: string
  expires_at?: string | null
  next_billing_at?: string | null
  max_students?: number | null
  max_teachers?: number | null
}) {
  return fetchJson<{ success: boolean; id: number }>('/api/subscriptions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export interface ChatMessage {
  id: number
  class_id: string
  user_id: number
  user_name: string
  user_role: string
  content: string
  translated_content: string | null
  is_flagged: number
  flagged_reason: string | null
  created_at: string
  class_name?: string
}

export interface ChatStats {
  total: number
  flagged: number
  chatEnabled: boolean
  byClass: { id: string; name: string; msg_count: number; flagged_count: number }[]
}

export function getChatStats() {
  return fetchJson<{ success: boolean; stats: ChatStats }>('/api/chat/admin/stats')
}

export function getChatMessages() {
  return fetchJson<{ success: boolean; messages: ChatMessage[] }>('/api/chat/admin/all')
}

export function getFlaggedChatMessages() {
  return fetchJson<{ success: boolean; messages: ChatMessage[] }>('/api/chat/flagged/list')
}

export function deleteChatMessage(messageId: number) {
  return fetchJson<{ success: boolean }>(`/api/chat/msg/${messageId}`, { method: 'DELETE' })
}

export function unflagChatMessage(messageId: number) {
  return fetchJson<{ success: boolean }>(`/api/chat/admin/unflag/${messageId}`, {
    method: 'PATCH',
  })
}

export function toggleChat(enabled: boolean) {
  return fetchJson<{ success: boolean; enabled: boolean }>('/api/chat/admin/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  })
}
