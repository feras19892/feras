import type { DashboardConfig } from '@/core/types/dashboard.types'

export const adminDashboardConfig: DashboardConfig = {
  id: 'admin',
  role: 'admin',
  title: 'admin.title',
  icon: '🛡️',

  tabs: [
    {
      id: 'overview',
      label: 'admin.nav.overview',
      icon: '📊',
      component: () => import('@/pages/admin/tabs/AdminOverviewV2.vue'),
      lazy: true
    },
    {
      id: 'experiments',
      label: 'admin.nav.experiments',
      icon: '🔬',
      component: () => import('@/pages/shared/Experiments.vue'),
      lazy: true
    },
    {
      id: 'exp-questions-stats',
      label: 'إحصائيات أسئلة التجارب',
      icon: '📈',
      component: () => import('@/components/experiment-questions/ExpQuestionsStats.vue'),
      lazy: true
    },
    {
      id: 'users',
      label: 'admin.nav.users',
      icon: '👥',
      component: () => import('@/pages/admin/tabs/AdminUsersV2.vue'),
      lazy: true
    },
    {
      id: 'user-detail',
      label: 'admin.nav.userDetail',
      icon: '👤',
      component: () => import('@/pages/admin/tabs/UserDetailV3.vue'),
      lazy: true
    },
    {
      id: 'schools',
      label: 'admin.nav.schools',
      icon: '🏫',
      component: () => import('@/pages/admin/tabs/SchoolsV2.vue'),
      lazy: true
    },
    {
      id: 'school-detail',
      label: 'admin.nav.schoolDetail',
      icon: '🏫',
      component: () => import('@/pages/admin/tabs/SchoolDetailV2.vue'),
      lazy: true
    },
    {
      id: 'classes',
      label: 'admin.nav.classes',
      icon: '📚',
      component: () => import('@/pages/admin/tabs/ClassesV2.vue'),
      lazy: true
    },
    {
      id: 'class-detail',
      label: 'admin.nav.classDetail',
      icon: '📚',
      component: () => import('@/pages/admin/tabs/ClassDetailV2.vue'),
      lazy: true
    },
    {
      id: 'reports',
      label: 'admin.nav.reports',
      icon: '📊',
      component: () => import('@/pages/admin/tabs/ReportsAnalyticsV2.vue'),
      lazy: true
    },
    {
      id: 'requests-approvals',
      label: 'admin.nav.requests-approvals',
      icon: '📋',
      component: () => import('@/pages/admin/tabs/RequestsApprovals.vue'),
      lazy: true
    },
    {
      id: 'notifications',
      label: 'admin.nav.notifications',
      icon: '🔔',
      component: () => import('@/pages/admin/tabs/Notifications.vue'),
      lazy: true
    },
    {
      id: 'subscriptions',
      label: 'admin.nav.subscriptions',
      icon: '💳',
      component: () => import('@/pages/admin/tabs/subscriptions/SubscriptionsTab.vue'),
      lazy: true
    },
    {
      id: 'chat',
      label: 'admin.nav.chat',
      icon: '💬',
      component: () => import('@/pages/admin/tabs/AdminChat.vue'),
      lazy: true
    },
    {
      id: 'system',
      label: 'admin.nav.system',
      icon: '⚙️',
      component: () => import('@/pages/admin/tabs/SystemV2.vue'),
      lazy: true,
      permissions: ['admin:system:manage']
    },
  ],

  layout: {
    sidebar: {
      collapsible: true,
      width: '280px',
      items: [
        { id: 'overview', label: 'admin.nav.overview', icon: '📊', tabId: 'overview' },
        { id: 'experiments', label: 'admin.nav.experiments', icon: '🔬', tabId: 'experiments' },
        { id: 'exp-questions-stats', label: 'إحصائيات أسئلة التجارب', icon: '📈', tabId: 'exp-questions-stats' },
        { id: 'users', label: 'admin.nav.users', icon: '👥', tabId: 'users' },
        { id: 'schools', label: 'admin.nav.schools', icon: '🏫', tabId: 'schools' },
        { id: 'classes', label: 'admin.nav.classes', icon: '📚', tabId: 'classes' },
        { id: 'reports', label: 'admin.nav.reports', icon: '📊', tabId: 'reports' },
        { id: 'requests-approvals', label: 'admin.nav.requests-approvals', icon: '📋', tabId: 'requests-approvals' },
        { id: 'notifications', label: 'admin.nav.notifications', icon: '🔔', tabId: 'notifications' },
        { id: 'subscriptions', label: 'admin.nav.subscriptions', icon: '💳', tabId: 'subscriptions' },
        { id: 'chat', label: 'admin.nav.chat', icon: '💬', tabId: 'chat' },
        { id: 'system', label: 'admin.nav.system', icon: '⚙️', tabId: 'system' },
      ]
    },
    header: {
      showBreadcrumbs: true,
      showSearch: false,
      showNotifications: true
    },
    showChat: false,
    showNotifications: true
  },

  permissions: [
    'admin:view',
    'admin:users:manage',
    'admin:schools:manage',
    'admin:system:manage'
  ]
}
