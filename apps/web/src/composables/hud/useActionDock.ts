import { computed } from 'vue'
import type { DashboardConfig } from '@/core/types/dashboard.types'

export interface DockAction {
  id: string
  label: string
  icon: string
}

const adminActions: Record<string, DockAction[]> = {
  overview: [
    { id: 'schools', label: 'المدارس', icon: '🏫' },
    { id: 'users', label: 'المستخدمون', icon: '👤' },
    { id: 'reports', label: 'التقارير', icon: '📄' },
  ],
  schools: [
    { id: 'add-school', label: 'إضافة مدرسة', icon: '➕' },
    { id: 'export', label: 'تصدير', icon: '📤' },
    { id: 'reports', label: 'التقارير', icon: '📄' },
  ],
  users: [
    { id: 'add-user', label: 'إضافة مستخدم', icon: '➕' },
    { id: 'export', label: 'تصدير', icon: '📤' },
    { id: 'refresh', label: 'تحديث', icon: '🔄' },
  ],
  classes: [
    { id: 'add-class', label: 'إضافة فصل', icon: '➕' },
    { id: 'refresh', label: 'تحديث', icon: '🔄' },
  ],
  reports: [
    { id: 'export', label: 'تصدير', icon: '📤' },
    { id: 'refresh', label: 'تحديث', icon: '🔄' },
  ],
  notifications: [
    { id: 'send-alert', label: 'إرسال تنبيه', icon: '🔔' },
    { id: 'new-announcement', label: 'إعلان جديد', icon: '📢' },
  ],
  requests: [
    { id: 'refresh', label: 'تحديث', icon: '🔄' },
  ],
  feedback: [
    { id: 'refresh', label: 'تحديث', icon: '🔄' },
  ],
  'system-hub': [
    { id: 'refresh', label: 'تحديث', icon: '🔄' },
  ],
}

export function useActionDock(config: DashboardConfig, tabId: string) {
  const items = computed<DockAction[]>(() => {
    if (config.role !== 'admin') return []
    return adminActions[tabId] || []
  })

  return {
    items,
  }
}
