import { fetchJson } from '../http'
import type { Report } from '../report.service'

export interface StudentClass {
  id: string
  name: string
  code: string
  is_active: number
  teacher_name?: string
  student_count?: number
  created_at: string
}

export function getMyClasses() {
  return fetchJson<{ success: boolean; classes: StudentClass[] }>('/api/classes')
}

export function getReports(params?: { class_id?: string; status?: string; page?: number; limit?: number }) {
  const qs = params ? '?' + new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString() : ''
  return fetchJson<{ success: boolean; reports: Report[]; total: number; page: number; limit: number; totalPages: number }>(`/api/reports${qs}`)
}

export function getReport(id: number) {
  return fetchJson<{ success: boolean; report: Report }>(`/api/reports/${id}`)
}

export function getStudentStats(studentId: number) {
  return fetchJson<{ success: boolean; stats: { total: number; graded: number; pending: number; average: number } }>(`/api/reports/student/${studentId}/stats`)
}

export function joinClass(code: string) {
  return fetchJson<{ success: boolean; class_id?: string; name?: string; message?: string }>('/api/classes/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
}

export function leaveClass(id: string) {
  return fetchJson<{ success: boolean }>('/api/classes/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ class_id: id }),
  })
}
