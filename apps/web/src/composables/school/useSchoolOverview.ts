export interface SchoolCard {
  icon: string
  label: string
  value: number
  totalLabel: string
  color: string
  tab?: string
}

export interface SchoolClassBar {
  name: string
  count: number
  percent: number
  color: string
}

export interface SchoolLinePoint {
  label: string
  x: number
  y: number
}

import { computed, onActivated, onDeactivated, onMounted, onUnmounted, ref } from 'vue'
import { useSchoolStore } from '@/stores/school.store'
import { eventBus } from '@/composables/shared/useEventBus'
import type { SchoolClass } from '@/services/core/school.api'
import {
  getSchoolDetailedReports,
  getOutstandingStudents,
  getStrugglingStudents,
  getTeacherEvaluation,
  getSchoolFeedback,
  type SchoolDetailedReport,
  type OutstandingStudent,
  type StrugglingStudent,
  type TeacherEvaluation,
  type SchoolFeedbackStats,
} from '@/services/school-reports.service'

export function useSchoolOverview() {
  const store = useSchoolStore()
  const loading = ref(false)
  const error = ref('')
  const dailyReport = ref<SchoolDetailedReport | null>(null)
  const outstanding = ref<OutstandingStudent[]>([])
  const struggling = ref<StrugglingStudent[]>([])
  const teachers = ref<TeacherEvaluation[]>([])
  const feedback = ref<SchoolFeedbackStats | null>(null)
  let isMounted = true

  const barColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

  const today = computed(() => new Date().toLocaleDateString('ar', { weekday: 'long', month: 'long', day: 'numeric' }))
  const schoolName = computed(() => store.stats?.school?.name || 'مدرستي')
  const schoolCode = computed(() => store.stats?.school?.code || '—')

  const capacityAlert = computed(() => {
    const school = store.stats?.school
    const stats = store.stats?.stats
    if (!school || !stats) return ''
    const studentRatio = school.max_students ? stats.students / school.max_students : 0
    const teacherRatio = school.max_teachers ? stats.teachers / school.max_teachers : 0
    if (studentRatio >= 0.9) return `الطلبة وصلوا إلى ${Math.round(studentRatio * 100)}% من السعة`
    if (teacherRatio >= 0.9) return `المدرسون وصلوا إلى ${Math.round(teacherRatio * 100)}% من السعة`
    return ''
  })

  const cards = computed(() => {
    const stats = store.stats?.stats
    const school = store.stats?.school
    const sum = dailyReport.value?.summary
    const cls = dailyReport.value?.classes ?? []
    const gradedToday = cls.reduce((s, c) => s + c.graded_today, 0)
    const avgAvg = cls.length ? Math.round(cls.reduce((s, c) => s + c.class_average, 0) / cls.length) : 0
    return [
      { icon: '👨‍🎓', label: 'الطلاب', value: stats?.students ?? 0, totalLabel: `من ${school?.max_students ?? 0}`, color: '#3b82f6', tab: 'students' },
      { icon: '👨‍🏫', label: 'المدرسون', value: stats?.teachers ?? 0, totalLabel: `من ${school?.max_teachers ?? 0}`, color: '#8b5cf6', tab: 'teachers' },
      { icon: '📚', label: 'الفصول', value: stats?.classes ?? 0, totalLabel: 'فصل', color: '#10b981', tab: 'classes' },
      { icon: '📝', label: 'تقارير اليوم', value: sum?.reports_today ?? stats?.reports ?? 0, totalLabel: 'تقرير', color: '#f59e0b', tab: 'reports' },
      { icon: '⏳', label: 'معلّقة', value: sum?.pending_reports ?? 0, totalLabel: 'تقرير', color: '#f59e0b', tab: 'reports' },
      { icon: '✅', label: 'مصحّحة اليوم', value: gradedToday, totalLabel: 'تقرير', color: '#10b981', tab: 'reports' },
      { icon: '🧮', label: 'متوسط الفصول', value: avgAvg, totalLabel: '%', color: '#8b5cf6', tab: 'reports' },
      { icon: '🌟', label: 'متميزون', value: outstanding.value.length, totalLabel: 'طالب', color: '#06b6d4', tab: 'students' },
      { icon: '⚠️', label: 'يحتاجون دعماً', value: struggling.value.length, totalLabel: 'طالب', color: '#ef4444', tab: 'students' },
    ]
  })

  const classBarData = computed(() => {
    const max = Math.max(1, ...store.classes.map((c: SchoolClass) => c.student_count ?? 0))
    return [...store.classes]
      .sort((a, b) => (b.student_count ?? 0) - (a.student_count ?? 0))
      .slice(0, 6)
      .map((c: SchoolClass, i) => ({
        name: c.name,
        count: c.student_count ?? 0,
        percent: Math.round(((c.student_count ?? 0) / max) * 100),
        color: barColors[i % barColors.length],
      }))
  })

  const lineData = computed(() => {
    const counts: Record<string, number> = {}
    for (const c of dailyReport.value?.classes ?? []) {
      const key = dailyReport.value?.date ?? ''
      counts[key] = (counts[key] || 0) + c.reports_today
    }
    const days: { label: string; x: number; y: number }[] = []
    const list: { label: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('ar', { day: 'numeric' })
      list.push({ label, count: counts[key] || 0 })
    }
    const max = Math.max(1, ...list.map(x => x.count))
    const step = list.length > 1 ? 260 / (list.length - 1) : 0
    list.forEach((d, i) => {
      days.push({ label: d.label, x: 10 + i * step, y: 90 - (d.count / max) * 70 })
    })
    return days
  })

  const gridLines = [20, 40, 60, 80]
  const linePoints = computed(() => lineData.value.map(p => `${p.x},${p.y}`).join(' '))

  const recentUsers = computed(() =>
    [...store.users].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 6)
  )

  function formatDate(d: string | null | undefined) {
    return d ? new Date(d).toLocaleDateString('ar') : '—'
  }

  function goToTab(tabId: string) {
    eventBus.emit('school:switch-tab', { tabId })
  }

  async function load() {
    loading.value = true
    error.value = ''
    try {
      await store.refreshAll()
      if (!isMounted) return
      const [daily, out, str, evals, feed] = await Promise.allSettled([
        getSchoolDetailedReports(),
        getOutstandingStudents(5),
        getStrugglingStudents(5),
        getTeacherEvaluation(),
        getSchoolFeedback(),
      ])
      if (!isMounted) return
      if (daily.status === 'fulfilled' && daily.value.success) dailyReport.value = daily.value.report
      if (out.status === 'fulfilled' && out.value.success) outstanding.value = out.value.students
      if (str.status === 'fulfilled' && str.value.success) struggling.value = str.value.students
      if (evals.status === 'fulfilled' && evals.value.success) teachers.value = evals.value.evaluations
      if (feed.status === 'fulfilled' && feed.value.success) feedback.value = feed.value.stats
    } catch (e: any) {
      if (isMounted) error.value = e?.message || 'فشل التحميل'
    } finally {
      if (isMounted) loading.value = false
    }
  }

  const liveEvents = ['report:submitted', 'class:created', 'class:updated', 'dashboard:refresh'] as const

  function addListeners() {
    for (const e of liveEvents) eventBus.on(e, load)
  }

  function removeListeners() {
    for (const e of liveEvents) eventBus.off(e, load)
  }

  onMounted(() => { isMounted = true; addListeners(); load() })
  onActivated(() => { isMounted = true; addListeners(); load() })
  onDeactivated(() => { isMounted = false; removeListeners() })
  onUnmounted(() => { isMounted = false; removeListeners() })

  return {
    loading, error, dailyReport, outstanding, struggling, teachers, feedback,
    today, schoolName, schoolCode, capacityAlert, cards, classBarData, lineData, gridLines, linePoints, recentUsers,
    formatDate, goToTab, load,
  }
}
