import type { DashboardConfig } from '@/core/types/dashboard.types'

export const teacherDashboardConfig: DashboardConfig = {
  id: 'teacher',
  role: 'teacher',
  title: 'لوحة المعلم',
  icon: '👨‍🏫',

  tabs: [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: '🏠',
      component: () => import('@/pages/teacher/tabs/Home.vue'),
      lazy: true
    },
    {
      id: 'my-classes',
      label: 'فصولي',
      icon: '📚',
      component: () => import('@/pages/teacher/tabs/MyClasses.vue'),
      lazy: true
    },
    {
      id: 'schedule',
      label: 'الجدول الزمني',
      icon: '📅',
      component: () => import('@/pages/teacher/tabs/Schedule.vue'),
      lazy: true
    },
    {
      id: 'quizzes',
      label: 'الامتحانات',
      icon: '📝',
      component: () => import('@/pages/teacher/tabs/Quizzes.vue'),
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
      id: 'exp-questions',
      label: 'أسئلة التجارب',
      icon: '❓',
      component: () => import('@/pages/teacher/tabs/ExperimentQuestions.vue'),
      lazy: true
    },
    {
      id: 'grading',
      label: 'تقارير التجارب',
      icon: '📄',
      component: () => import('@/pages/teacher/tabs/Grading.vue'),
      lazy: true
    },
    {
      id: 'chat',
      label: 'الدردشة',
      icon: '💬',
      component: () => import('@/pages/teacher/tabs/Chat.vue'),
      lazy: true
    },
    {
      id: 'notifications',
      label: 'الإشعارات',
      icon: '🔔',
      component: () => import('@/pages/teacher/tabs/Notifications.vue'),
      lazy: true
    },
    {
      id: 'complaints',
      label: 'التقييم والشكاوى',
      icon: '⭐',
      component: () => import('@/pages/teacher/tabs/Complaints.vue'),
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
      id: 'subscriptions',
      label: 'الاشتراك والدعوات',
      icon: '💳',
      component: () => import('@/pages/teacher/tabs/TeacherSubscriptions.vue'),
      lazy: true
    }
  ],

  layout: {
    sidebar: {
      collapsible: true,
      width: '280px',
      items: [
        { id: 'home', label: 'الرئيسية', icon: '🏠', tabId: 'home' },
        { id: 'my-classes', label: 'فصولي', icon: '📚', tabId: 'my-classes' },
        { id: 'schedule', label: 'الجدول الزمني', icon: '📅', tabId: 'schedule' },
        { id: 'quizzes', label: 'الامتحانات', icon: '📝', tabId: 'quizzes' },
        { id: 'experiments', label: 'التجارب', icon: '🔬', tabId: 'experiments' },
        { id: 'exp-questions', label: 'أسئلة التجارب', icon: '❓', tabId: 'exp-questions' },
        { id: 'grading', label: 'تقارير التجارب', icon: '📄', tabId: 'grading' },
        { id: 'chat', label: 'الدردشة', icon: '💬', tabId: 'chat' },
        { id: 'notifications', label: 'الإشعارات', icon: '🔔', tabId: 'notifications' },
        { id: 'complaints', label: 'التقييم والشكاوى', icon: '⭐', tabId: 'complaints' },
        { id: 'subscriptions', label: 'الاشتراك والدعوات', icon: '💳', tabId: 'subscriptions' },
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
    'teacher:view',
    'teacher:grading:manage',
    'teacher:quizzes:manage',
    'teacher:communication:view',
    'teacher:settings:manage'
  ]
}
