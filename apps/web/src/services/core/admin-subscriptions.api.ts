import { fetchJson } from '../http'

export interface AdminPlan {
  id: number
  type: 'student' | 'teacher' | 'school'
  name: string
  currency: string
  features: string | null
  is_active: number
  created_at: string
  updated_at: string
  package_count: number
}

export function getAdminPlans() {
  return fetchJson<{ success: boolean; plans: AdminPlan[] }>('/api/admin/subscriptions/plans')
}

export interface AdminPlanInput {
  type: 'student' | 'teacher' | 'school'
  name: string
  currency: string
  features: string | null
  is_active: number
}

export function createAdminPlan(data: Omit<AdminPlanInput, 'id'>) {
  return fetchJson<{ success: boolean; id: number }>('/api/admin/subscriptions/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function updateAdminPlan(id: number, data: Partial<AdminPlanInput>) {
  return fetchJson<{ success: boolean }>(`/api/admin/subscriptions/plans/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function toggleAdminPlan(id: number) {
  return fetchJson<{ success: boolean; is_active: number }>(
    `/api/admin/subscriptions/plans/${id}/toggle`,
    { method: 'POST' },
  )
}

export interface AdminPlanPackage {
  id: number
  plan_id: number
  teacher_count: number
  student_count: number
  price_cents_monthly: number
  price_cents_yearly: number
  currency: string
  stripe_product_id: string | null
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  is_active: number
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface AdminPlanPackageInput {
  teacher_count: number
  student_count: number
  price_cents_monthly: number
  price_cents_yearly: number
  currency: string
  stripe_product_id?: string | null
  stripe_price_id_monthly?: string | null
  stripe_price_id_yearly?: string | null
}

export function getPlanPackages(planId: number) {
  return fetchJson<{ success: boolean; packages: AdminPlanPackage[] }>(
    `/api/admin/subscriptions/plans/${planId}/packages`,
  )
}

export function createPlanPackage(planId: number, data: AdminPlanPackageInput) {
  return fetchJson<{ success: boolean; id: number }>(
    `/api/admin/subscriptions/plans/${planId}/packages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
}

export function deletePlanPackage(planId: number, pkgId: number) {
  return fetchJson<{ success: boolean }>(
    `/api/admin/subscriptions/plans/${planId}/packages/${pkgId}`,
    { method: 'DELETE' },
  )
}

export interface ActivationAccount {
  id: number
  type: 'user' | 'school'
  role?: string
  name: string
  email: string
  code?: string
  subscription_status: string
  total_codes: number
  unused_codes: number
  used_codes: number
  total_members: number
  student_members: number
  teacher_members: number
  created_at: string
}

export interface AdminInviteCode {
  id: number
  code: string
  owner_id: number
  owner_type: 'teacher' | 'school'
  role: 'student' | 'teacher'
  max_uses: number | null
  used_count: number
  is_active: number
  created_at: string
  expires_at: string | null
}

export function getActivationAccounts() {
  return fetchJson<{ success: boolean; accounts: ActivationAccount[] }>('/api/admin/invite-codes/accounts')
}

export function getAdminInviteCodes(ownerId?: number, ownerType?: 'teacher' | 'school') {
  const q = new URLSearchParams()
  if (ownerId != null) q.set('owner_id', String(ownerId))
  if (ownerType) q.set('owner_type', ownerType)
  const qs = q.toString()
  return fetchJson<{ success: boolean; invite_codes: AdminInviteCode[] }>(`/api/admin/invite-codes/codes${qs ? '?' + qs : ''}`)
}

export function createAdminInviteCode(data: {
  owner_id: number
  owner_type: 'teacher' | 'school'
  role: 'student' | 'teacher'
  max_uses?: number | null
  expires_at?: string | null
}) {
  return fetchJson<{ success: boolean; invite: AdminInviteCode }>('/api/admin/invite-codes/codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function updateAdminInviteCode(id: number, data: { is_active?: number; max_uses?: number | null; expires_at?: string | null }) {
  return fetchJson<{ success: boolean; invite: AdminInviteCode }>(`/api/admin/invite-codes/codes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function deleteAdminInviteCode(id: number) {
  return fetchJson<{ success: boolean }>(`/api/admin/invite-codes/codes/${id}`, { method: 'DELETE' })
}

export interface AdminInvoice {
  id: number
  subscription_id: number | null
  owner_id: number
  owner_type: 'user' | 'school'
  owner_name: string
  owner_email: string
  amount_cents: number
  currency: string
  status: 'unpaid' | 'paid' | 'cancelled'
  payment_provider: string | null
  payment_reference: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export function getAdminInvoices(params: {
  status?: string
  owner_type?: string
  search?: string
  sort?: string
  order?: string
  page?: number
  limit?: number
}) {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  if (params.owner_type) q.set('owner_type', params.owner_type)
  if (params.search) q.set('search', params.search)
  if (params.sort) q.set('sort', params.sort)
  if (params.order) q.set('order', params.order)
  if (params.page) q.set('page', String(params.page))
  if (params.limit) q.set('limit', String(params.limit))
  const qs = q.toString()
  return fetchJson<{ success: boolean; invoices: AdminInvoice[]; total: number }>(`/api/admin/invoices${qs ? '?' + qs : ''}`)
}

export function updateInvoiceStatus(id: number, status: string) {
  return fetchJson<{ success: boolean; invoice: AdminInvoice }>(`/api/admin/invoices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export interface SubscriptionControl {
  id: number
  type: 'maintenance' | 'renewal' | 'outage' | 'reminder'
  target_role: 'all' | 'student' | 'teacher' | 'school'
  scope: 'individual' | 'group'
  duration_days: number
  start_date: string | null
  end_date: string | null
  message: string | null
  is_active: number
  created_at: string
  updated_at: string
}

export interface SubscriptionControlInput {
  type: 'maintenance' | 'renewal' | 'outage' | 'reminder'
  target_role: 'all' | 'student' | 'teacher' | 'school'
  scope: 'individual' | 'group'
  duration_days: number
  start_date?: string | null
  end_date?: string | null
  message?: string | null
  is_active?: number
}

export function getSubscriptionControls(params?: {
  type?: string
  target_role?: string
  scope?: string
  is_active?: string
  sort?: string
  order?: string
}) {
  const q = new URLSearchParams()
  if (params?.type) q.set('type', params.type)
  if (params?.target_role) q.set('target_role', params.target_role)
  if (params?.scope) q.set('scope', params.scope)
  if (params?.is_active) q.set('is_active', params.is_active)
  if (params?.sort) q.set('sort', params.sort)
  if (params?.order) q.set('order', params.order)
  const qs = q.toString()
  return fetchJson<{ success: boolean; controls: SubscriptionControl[] }>(`/api/admin/subscription-controls${qs ? '?' + qs : ''}`)
}

export function createSubscriptionControl(data: SubscriptionControlInput) {
  return fetchJson<{ success: boolean; id: number }>('/api/admin/subscription-controls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function updateSubscriptionControl(id: number, data: Partial<SubscriptionControlInput>) {
  return fetchJson<{ success: boolean }>(`/api/admin/subscription-controls/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function deleteSubscriptionControl(id: number) {
  return fetchJson<{ success: boolean }>(`/api/admin/subscription-controls/${id}`, { method: 'DELETE' })
}

export function applySubscriptionControl(id: number) {
  return fetchJson<{ success: boolean; message: string }>(`/api/admin/subscription-controls/${id}/apply`, { method: 'POST' })
}
