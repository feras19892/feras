import type { DashboardConfig } from '@/core/types/dashboard.types'

export const studentDashboardConfig: DashboardConfig = {
  id: 'student',
  role: 'student',
  title: 'لوحة الطالب',
  icon: '👨‍🎓',

  tabs: [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: '🏠',
      component: () => import('@/pages/student/tabs/Home.vue'),
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
      id: 'my-classes',
      label: 'فصولي',
      icon: '📚',
      component: () => import('@/pages/student/tabs/MyClasses.vue'),
      lazy: true
    },
    {
      id: 'my-reports',
      label: 'تقاريري',
      icon: '📄',
      component: () => import('@/pages/student/tabs/MyReports.vue'),
      lazy: true
    },
    {
      id: 'quizzes',
      label: 'الامتحانات',
      icon: '📝',
      component: () => import('@/pages/student/tabs/Quizzes.vue'),
      lazy: true
    },
    {
      id: 'chat',
      label: 'الدردشة',
      icon: '💬',
      component: () => import('@/pages/student/tabs/Chat.vue'),
      lazy: true
    },
    {
      id: 'notifications',
      label: 'الإشعارات',
      icon: '🔔',
      component: () => import('@/pages/student/tabs/Notifications.vue'),
      lazy: true
    },
    {
      id: 'complaints',
      label: 'التقييم والشكاوى',
      icon: '⭐',
      component: () => import('@/pages/student/tabs/Complaints.vue'),
      lazy: true
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: '⚙️',
      component: () => import('@/pages/shared/UserSettings.vue'),
      lazy: true
    },
    {
      id: 'billing',
      label: 'اشتراكي',
      icon: '💳',
      component: () => import('@/pages/student/tabs/StudentBilling.vue'),
      lazy: true
    }
  ],

  layout: {
    sidebar: {
      collapsible: true,
      width: '280px',
      items: [
        { id: 'home', label: 'الرئيسية', icon: '🏠', tabId: 'home' },
        { id: 'experiments', label: 'التجارب', icon: '🔬', tabId: 'experiments' },
        { id: 'my-classes', label: 'فصولي', icon: '📚', tabId: 'my-classes' },
        { id: 'my-reports', label: 'تقاريري', icon: '📄', tabId: 'my-reports' },
        { id: 'quizzes', label: 'الامتحانات', icon: '📝', tabId: 'quizzes' },
        { id: 'chat', label: 'الدردشة', icon: '💬', tabId: 'chat' },
        { id: 'notifications', label: 'الإشعارات', icon: '🔔', tabId: 'notifications' },
        { id: 'complaints', label: 'التقييم والشكاوى', icon: '⭐', tabId: 'complaints' },
        { id: 'billing', label: 'اشتراكي', icon: '💳', tabId: 'billing' },
        { id: 'settings', label: 'الإعدادات', icon: '⚙️', tabId: 'settings' }
      ]
    },
    header: {
      showBreadcrumbs: true,
      showSearch: true,
      showNotifications: true
    },
    showNotifications: true
  },
  
  permissions: [
    'student:view',
    'student:quizzes:manage',
    'student:communication:view',
    'student:settings:manage'
  ]
}
