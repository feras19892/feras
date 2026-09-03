import { fetchJson } from '../http'

export interface SchoolStats {
  students: number
  teachers: number
  classes: number
  reports: number
}

export interface SchoolProfile {
  id: number
  email: string
  name: string
  code: string
  max_students: number
  max_teachers: number
  is_active: boolean
  created_at?: string
}

export interface SchoolUser {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  blocked_at?: string | null
}

export interface SchoolClass {
  id: string
  name: string
  code: string
  teacher_name: string
  student_count: number
  created_at: string
  is_frozen?: number
}

export interface SubscriptionSettings {
  [key: string]: string
}

export function getSubscriptionSettings() {
  return fetchJson<{ success: boolean; data: SubscriptionSettings }>('/api/settings/subscription')
}

export function getStats() {
  return fetchJson<{ success: boolean; stats: SchoolStats; school: SchoolProfile }>('/api/school/stats')
}

export function getProfile() {
  return fetchJson<{ success: boolean; school: SchoolProfile }>('/api/school/me')
}

export function getUsers(page = 1, limit = 50) {
  return fetchJson<{ success: boolean; users: SchoolUser[]; total: number }>(`/api/school/users?page=${page}&limit=${limit}`)
}

export function getClasses() {
  return fetchJson<{ success: boolean; classes: SchoolClass[] }>('/api/school/classes')
}

export function createClass(name: string, teacherId?: number, description?: string) {
  const body: Record<string, unknown> = { name, description }
  if (teacherId) body.teacher_id = teacherId
  return fetchJson<{ success: boolean }>('/api/school/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function createSchoolUser(name: string, email: string, password: string, role: string) {
  return fetchJson<{ success: boolean }>('/api/school/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  })
}

export function deleteClass(id: string) {
  return fetchJson<{ success: boolean }>(`/api/school/classes/${id}`, { method: 'DELETE' })
}

export function blockUser(id: number, days = 0, reason = '') {
  return fetchJson<{ success: boolean }>(`/api/school/users/${id}/block`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days, reason: reason.trim() || 'بدون سبب' }),
  })
}

export function unblockUser(id: number) {
  return fetchJson<{ success: boolean }>(`/api/school/users/${id}/unblock`, { method: 'PATCH' })
}

export function removeUser(id: number) {
  return fetchJson<{ success: boolean }>(`/api/school/users/${id}`, { method: 'DELETE' })
}

export function freezeClass(classId: string, reason: string) {
  return fetchJson<{ success: boolean }>('/api/school/freeze-class', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ class_id: classId, reason }),
  })
}

export function unfreezeClass(classId: string) {
  return fetchJson<{ success: boolean }>('/api/school/unfreeze-class', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ class_id: classId }),
  })
}

export function reassignTeacher(classId: string, teacherId?: number) {
  return fetchJson<{ success: boolean }>(`/api/school/classes/${classId}/teacher`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teacher_id: teacherId }),
  })
}

export function getClassActivity(classId: string) {
  return fetchJson<{ success: boolean; logs: any[] }>(`/api/school/classes/${classId}/activity`, { method: 'GET' })
}

export function updateName(name: string) {
  return fetchJson<{ success: boolean }>('/api/school/update-name', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export interface SchoolSubscription {
  id: number
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
  starts_at: string
  expires_at?: string | null
  next_billing_at?: string | null
  plan_name?: string | null
  plan_type?: string | null
  price_cents?: number | null
  max_students?: number | null
  max_teachers?: number | null
}

export interface InviteCode {
  id: number
  code: string
  max_uses: number
  used_count: number
  is_active: number
  created_at: string
  expires_at?: string | null
  role?: 'student' | 'teacher'
}

export interface TenantMember {
  member_id: number
  name: string
  email: string
  joined_at: string
  status: string
  role?: string
  invite_code_id?: number | null
  blocked_at?: string | null
  block_until?: string | null
  block_reason?: string | null
}

export function getMySubscription() {
  return fetchJson<{ success: boolean; subscription?: SchoolSubscription }>('/api/subscriptions/me')
}

export function getInviteCodes() {
  return fetchJson<{ success: boolean; invite_codes: InviteCode[] }>('/api/invite-codes')
}

export function createInviteCode(role: 'student' | 'teacher', maxUses = 100) {
  return fetchJson<{ success: boolean; invite?: InviteCode; message?: string }>('/api/invite-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, max_uses: maxUses }),
  })
}

export function createInviteCodes(quantity: number, role: 'student' | 'teacher' = 'student', maxUses = 1) {
  return fetchJson<{ success: boolean; invites?: InviteCode[]; message?: string }>('/api/invite-codes/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity, role, max_uses: maxUses }),
  })
}

export function getTenantMembers() {
  return fetchJson<{ success: boolean; members: TenantMember[] }>('/api/invite-codes/members')
}

export function activateTenantMember(memberId: number) {
  return fetchJson<{ success: boolean }>(`/api/invite-codes/members/${memberId}/activate`, { method: 'POST' })
}

export function suspendTenantMember(memberId: number) {
  return fetchJson<{ success: boolean }>(`/api/invite-codes/members/${memberId}/suspend`, { method: 'POST' })
}

export function removeTenantMember(memberId: number) {
  return fetchJson<{ success: boolean }>(`/api/invite-codes/members/${memberId}`, { method: 'DELETE' })
}

export function joinWithInviteCode(code: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/invite-codes/${encodeURIComponent(code)}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
}
