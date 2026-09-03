/**
 * Unified label and formatting utilities for all dashboards.
 * Eliminates duplicated roleLabel/statusLabel/formatDate across tabs.
 */

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'مدير',
    school: 'مدرسة',
    teacher: 'مدرس',
    student: 'طالب',
  }
  return labels[role] || role
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'مسودة',
    submitted: 'مرسل',
    graded: 'مصحح',
    resubmitted: 'إعادة إرسال',
    pending: 'قيد الانتظار',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
    active: 'نشط',
    inactive: 'غير نشط',
    blocked: 'محظور',
  }
  return labels[status] || status
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('ar')
  } catch {
    return '—'
  }
}

export function formatDateTime(d: string | null | undefined): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString('ar')
  } catch {
    return '—'
  }
}

export function formatRelative(d: string | null | undefined): string {
  if (!d) return '—'
  try {
    const now = Date.now()
    const then = new Date(d).getTime()
    const diff = now - then
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return 'الآن'
    if (minutes < 60) return `قبل ${minutes} دقيقة`
    if (hours < 24) return `قبل ${hours} ساعة`
    if (days < 30) return `قبل ${days} يوم`
    return formatDate(d)
  } catch {
    return '—'
  }
}
