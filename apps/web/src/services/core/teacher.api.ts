import { fetchJson } from '../http'
import type { Report } from '../report.service'

export interface TeacherClass {
  id: string
  name: string
  code: string
  is_active: number
  is_frozen?: number
  teacher_name?: string
  student_count?: number
  created_at: string
}

export function getMyClasses() {
  return fetchJson<{ success: boolean; classes: TeacherClass[] }>('/api/classes')
}

export function createClass(name: string) {
  return fetchJson<{ success: boolean; class: TeacherClass; message?: string }>('/api/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export function getReports(params?: { class_id?: string; status?: string; page?: number; limit?: number }) {
  const qs = params ? '?' + new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString() : ''
  return fetchJson<{ success: boolean; reports: Report[]; total: number; page: number; limit: number; totalPages: number }>(`/api/reports${qs}`)
}

export function gradeReport(id: number, data: { grade: number; feedback?: string; grade_accuracy?: number; grade_presentation?: number; grade_conclusion?: number; grade_innovation?: number }) {
  return fetchJson<{ success: boolean }>(`/api/reports/${id}/grade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function getPendingCount() {
  return fetchJson<{ success: boolean; pendingCount: number }>('/api/classes/stats/pending')
}

export function getClassStats(id: string) {
  return fetchJson<{ success: boolean; stats: any }>(`/api/classes/${id}/stats`)
}

export interface TeacherClassStudent {
  id: number
  name: string
  email: string
  joined_at: string
  blocked_at: string | null
  penalty_count: number
  reward_count: number
  badge_count: number
  total_points: number
}

export function getClassStudents(id: string) {
  return fetchJson<{ success: boolean; class: TeacherClass; students: TeacherClassStudent[] }>(`/api/classes/${id}`)
}

export function removeStudentFromClass(classId: string, studentId: number) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/classes/${classId}/students/${studentId}`, { method: 'DELETE' })
}

export function freezeStudent(classId: string, studentId: number) {
  return fetchJson<{ success: boolean; frozen: boolean; message?: string }>(`/api/classes/${classId}/students/${studentId}/freeze`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } })
}

export function updateClass(classId: string, data: { name?: string; is_active?: boolean; is_frozen?: boolean }) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/classes/${classId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function deleteClass(classId: string) {
  return fetchJson<{ success: boolean; message?: string }>(`/api/classes/${classId}`, { method: 'DELETE' })
}

export function regenerateCode(classId: string) {
  return fetchJson<{ success: boolean; code?: string; message?: string }>(`/api/classes/${classId}/regenerate-code`, { method: 'PATCH' })
}

export interface StudentProfile {
  student: { id: number; name: string; email: string; avatar_url: string | null; created_at: string; school_id: number | null; blocked_at?: string | null }
  membership: { joined_at: string } | null
  className: string
  stats: {
    totalReports: number; gradedReports: number; pendingReports: number; avgGrade: number
    totalQuizzes: number; completedQuizzes: number; quizAvg: number
    badges: number; penaltyPoints: number; totalPoints: number
    lastLogin: string | null; totalLogins: number
  }
  reports: { id: number; experiment_name: string; status: string; grade: number | null; submitted_at: string }[]
  quizzes: { id: number; title: string; score: number | null; submitted_at: string | null }[]
  badges: { id: number; name: string; icon: string; type: string }[]
  penalties: { id: number; type: string; reason: string; points: number; created_at: string }[]
  sessions: { login_at: string; logout_at: string | null }[]
  activity: { action: string; details: string; created_at: string }[]
}

export function getStudentProfile(classId: string, studentId: number) {
  return fetchJson<{ success: boolean; profile: StudentProfile }>(`/api/classes/${classId}/students/${studentId}/profile`)
}

export function createPenalty(data: { student_id: number; class_id: string; type: string; reason: string; points: number }) {
  return fetchJson<{ success: boolean; penalty?: any; message?: string }>('/api/enh/penalties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function getAllBadges() {
  return fetchJson<{ success: boolean; badges: { id: number; name: string; icon: string; type: string; description: string }[] }>('/api/game/badges')
}

export function awardBadge(data: { student_id: number; badge_id: number; note?: string }) {
  return fetchJson<{ success: boolean; message?: string }>('/api/game/badges/award', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function createRating(data: { target_type: string; target_id: number; rating: number; comment?: string }) {
  return fetchJson<{ success: boolean; message?: string }>('/api/enh/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function getStudentReports(classId: string, studentId: number) {
  return fetchJson<{ success: boolean; reports: any[] }>(`/api/reports?class_id=${classId}&student_id=${studentId}`)
}

export function gradeStudentReport(reportId: number, data: { grade: number; feedback?: string }) {
  return fetchJson<{ success: boolean }>(`/api/reports/${reportId}/grade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
