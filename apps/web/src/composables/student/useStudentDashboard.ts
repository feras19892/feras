import { ref, computed, onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'
import { getReports, getStudentStats } from '../../services/report.service'
import type { Report } from '../../services/report.service'
import { getMyClasses, getBatchStudentData, joinClass as apiJoinClass, leaveClass as apiLeaveClass } from '../../services/class.service'
import type { ClassItem, ClassStudent } from '../../services/class.service'
import { useAuthStore } from '../../modules/auth/stores/auth'
import { useI18n } from '../useI18n'
import { eventBus } from '../shared/useEventBus'

export interface StudentKPI {
  totalReports: number
  gradedCount: number
  pendingCount: number
  draftCount: number
  avgGrade: number
  bestGrade: number
  totalClasses: number
  newFeedback: number
}

export interface StudentReportRow {
  id: number
  experimentName: string
  className: string
  status: string
  grade: number | null
  submittedAt: string | null
  feedback: string | null
  hasFeedback: boolean
  feedbackSeen: boolean
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 999
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

export function useStudentDashboard() {
  const auth = useAuthStore()
  const { t } = useI18n()
  const reports = ref<Report[]>([])
  const classes = ref<ClassItem[]>([])
  const classStudentsMap = ref<Record<string, ClassStudent[]>>({})
  const stats = ref<{ total: number; graded: number; pending: number; average: number; draft?: number; best_grade?: number; new_feedback?: number }>({ total: 0, graded: 0, pending: 0, average: 0 })
  const loading = ref(false)
  let isMounted = true
  let abortController: AbortController | null = null

  const kpi = computed<StudentKPI>(() => {
    let gradedCount = 0, pendingCount = 0, draftCount = 0
    let gradeSum = 0, gradeCount = 0, best = 0, newFeedback = 0

    for (const r of reports.value) {
      if (r.status === 'graded') {
        gradedCount++
        if (r.grade !== undefined && r.grade !== null) {
          gradeSum += r.grade
          gradeCount++
          if (r.grade > best) best = r.grade
        }
        if (r.feedback && !r.feedback_seen) newFeedback++
      } else if (r.status === 'submitted' || r.status === 'resubmitted') {
        pendingCount++
      } else if (r.status === 'draft') {
        draftCount++
      }
    }

    return {
      // الأولوية لعدّادات السيرفر الدقيقة (شاملة كل التقارير) — والقائمة المقتطعة fallback فقط
      totalReports: stats.value.total || reports.value.length,
      gradedCount: stats.value.graded || gradedCount,
      pendingCount: stats.value.pending || pendingCount,
      draftCount: stats.value.draft ?? draftCount,
      avgGrade: stats.value.average || (gradeCount ? Math.round(gradeSum / gradeCount) : 0),
      bestGrade: stats.value.best_grade ?? best,
      totalClasses: classes.value.length,
      newFeedback: stats.value.new_feedback ?? newFeedback,
    }
  })

  const reportRows = computed<StudentReportRow[]>(() => {
    return reports.value.map(r => {
      const cls = classes.value.find(c => c.id === r.class_id)
      return {
        id: r.id,
        experimentName: r.experiment_name,
        className: cls?.name || t('dashboard.unnamedClass', 'فصل بدون اسم'),
        status: r.status,
        grade: r.grade ?? null,
        submittedAt: r.submitted_at || r.created_at || null,
        feedback: r.feedback || null,
        hasFeedback: !!r.feedback,
        feedbackSeen: !!r.feedback_seen,
      }
    }).sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
  })

  const gradedReports = computed(() => reportRows.value.filter(r => r.status === 'graded'))
  const pendingReports = computed(() => reportRows.value.filter(r => r.status === 'submitted' || r.status === 'resubmitted'))
  const draftReports = computed(() => reportRows.value.filter(r => r.status === 'draft'))

  const recentReports = computed(() => reportRows.value.slice(0, 5))

  const overduePending = computed(() =>
    reportRows.value.filter(r => (r.status === 'submitted' || r.status === 'resubmitted') && r.submittedAt && daysSince(r.submittedAt) >= 7)
  )

  async function loadAll() {
    if (loading.value || !isMounted) return
    if (abortController) { abortController.abort(); abortController = null }
    abortController = new AbortController()
    loading.value = true
    try {
      const [rRes, cRes, batchRes, sRes] = await Promise.allSettled([
        getReports({ limit: 100 }, abortController.signal),
        getMyClasses(abortController.signal),
        getBatchStudentData(abortController.signal),
        auth.user ? getStudentStats(auth.user.id, abortController.signal) : Promise.resolve(null),
      ])
      if (!isMounted) return
      if (rRes.status === 'fulfilled' && rRes.value.success) reports.value = rRes.value.reports
      if (cRes.status === 'fulfilled' && cRes.value.success) classes.value = cRes.value.classes
      if (batchRes.status === 'fulfilled' && batchRes.value.success) classStudentsMap.value = batchRes.value.studentsMap
      if (sRes.status === 'fulfilled' && sRes.value?.success) stats.value = sRes.value.stats
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (import.meta.env.DEV) console.error('student dashboard load failed:', err);
    } finally {
      if (isMounted) loading.value = false
    }
  }

  async function joinClassByCode(code: string) {
    const res = await apiJoinClass(code.toUpperCase())
    if (res.success && res.class_id && res.name) {
      await loadAll()
    }
    return res
  }

  async function leaveClassById(id: string) {
    const res = await apiLeaveClass(id)
    if (res.success) {
      classes.value = classes.value.filter(c => c.id !== id)
      delete classStudentsMap.value[id]
    }
    return res
  }

  const liveEvents = ['report:graded', 'class:created', 'dashboard:refresh'] as const
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  function attach() {
    for (const e of liveEvents) eventBus.on(e, loadAll)
    refreshTimer = setInterval(() => { if (document.visibilityState === 'visible' && isMounted) loadAll() }, 300000)
  }

  function detach() {
    for (const e of liveEvents) eventBus.off(e, loadAll)
    if (abortController) { abortController.abort(); abortController = null }
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
  }

  onMounted(() => { isMounted = true; attach(); loadAll() })
  onActivated(() => { isMounted = true; attach(); loadAll() })
  onDeactivated(() => { isMounted = false; detach() })
  onUnmounted(() => { isMounted = false; detach() })

  return {
    reports, classes, classStudentsMap, stats, loading,
    kpi, reportRows, gradedReports, pendingReports, draftReports,
    recentReports, overduePending,
    joinClassByCode, leaveClassById,
    reload: loadAll,
  }
}
