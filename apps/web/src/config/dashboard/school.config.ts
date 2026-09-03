import type { DashboardConfig } from '@/core/types/dashboard.types'

export const schoolDashboardConfig: DashboardConfig = {
  id: 'school',
  role: 'school',
  title: 'لوحة المدرسة',
  icon: '🏫',
  
  tabs: [
    {
      id: 'overview',
      label: 'نظرة عامة',
      icon: '📊',
      component: () => import('@/pages/school/tabs/SchoolOverviewV2.vue'),
      lazy: true
    },
    {
      id: 'experiments',
      label: 'التجارب',
      icon: '🔬',
      component: () => import('@/pages/shared/Experiments.vue'),
      lazy: true
    },
    {
      id: 'teachers',
      label: 'المدرسون',
      icon: '👨‍🏫',
      component: () => import('@/pages/school/tabs/SchoolTeachers.vue'),
      lazy: true
    },
    {
      id: 'students',
      label: 'الطلاب',
      icon: '👨‍🎓',
      component: () => import('@/pages/school/tabs/SchoolStudents.vue'),
      lazy: true
    },
    {
      id: 'classes',
      label: 'الفصول',
      icon: '📚',
      component: () => import('@/pages/school/tabs/SchoolClasses.vue'),
      lazy: true
    },
    {
      id: 'warnings',
      label: 'التحذيرات',
      icon: '⚠️',
      component: () => import('@/pages/school/tabs/SchoolWarnings.vue'),
      lazy: true
    },
    {
      id: 'notifications',
      label: 'الإشعارات',
      icon: '🔔',
      component: () => import('@/pages/school/tabs/SchoolNotifications.vue'),
      lazy: true
    },
    {
      id: 'feedback',
      label: 'الشكاوى والتقييمات',
      icon: '💬',
      component: () => import('@/pages/school/tabs/SchoolFeedback.vue'),
      lazy: true
    },
    {
      id: 'activity',
      label: 'سجل النشاطات',
      icon: '⏱️',
      component: () => import('@/pages/school/tabs/SchoolActivity.vue'),
      lazy: true
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: '📄',
      component: () => import('@/pages/school/tabs/SchoolReports.vue'),
      lazy: true
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: '⚙️',
      component: () => import('@/pages/school/tabs/SchoolSettings.vue'),
      lazy: true
    },
    {
      id: 'billing',
      label: 'الاشتراكات والفوترة',
      icon: '💳',
      component: () => import('@/pages/school/tabs/SchoolBilling.vue'),
      lazy: true
    }
  ],

  layout: {
    sidebar: {
      collapsible: true,
      width: '280px',
      items: [
        { id: 'overview', label: 'نظرة عامة', icon: '📊', tabId: 'overview' },
        { id: 'experiments', label: 'التجارب', icon: '🔬', tabId: 'experiments' },
        { id: 'teachers', label: 'المدرسون', icon: '👨‍🏫', tabId: 'teachers' },
        { id: 'students', label: 'الطلاب', icon: '👨‍🎓', tabId: 'students' },
        { id: 'classes', label: 'الفصول', icon: '📚', tabId: 'classes' },
        { id: 'warnings', label: 'التحذيرات', icon: '⚠️', tabId: 'warnings' },
        { id: 'notifications', label: 'الإشعارات', icon: '🔔', tabId: 'notifications' },
        { id: 'feedback', label: 'الشكاوى والتقييمات', icon: '💬', tabId: 'feedback' },
        { id: 'activity', label: 'سجل النشاطات', icon: '⏱️', tabId: 'activity' },
        { id: 'reports', label: 'التقارير', icon: '📄', tabId: 'reports' },
        { id: 'billing', label: 'الاشتراكات والفوترة', icon: '💳', tabId: 'billing' },
        { id: 'settings', label: 'الإعدادات', icon: '⚙️', tabId: 'settings' }
      ]
    },
    header: {
      showBreadcrumbs: true,
      showSearch: true,
      showNotifications: true
    },
    showChat: false,
    showNotifications: true
  },
  
  permissions: [
    'school:view',
    'school:users:manage',
    'school:classes:manage',
    'school:settings:manage'
  ]
}
