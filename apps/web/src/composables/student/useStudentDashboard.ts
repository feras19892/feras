import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getReports, getStudentStats } from '../../services/report.service'
import type { Report } from '../../services/report.service'
import { getMyClasses, getClassDetails, joinClass as apiJoinClass, leaveClass as apiLeaveClass } from '../../services/class.service'
import type { ClassItem, ClassStudent } from '../../services/class.service'
import { useAuthStore } from '../../modules/auth/stores/auth'

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
  const reports = ref<Report[]>([])
  const classes = ref<ClassItem[]>([])
  const classStudentsMap = ref<Record<string, ClassStudent[]>>({})
  const stats = ref({ total: 0, graded: 0, pending: 0, average: 0 })
  const loading = ref(false)

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
      totalReports: reports.value.length,
      gradedCount,
      pendingCount,
      draftCount,
      avgGrade: gradeCount ? Math.round(gradeSum / gradeCount) : 0,
      bestGrade: best,
      totalClasses: classes.value.length,
      newFeedback,
    }
  })

  const reportRows = computed<StudentReportRow[]>(() => {
    return reports.value.map(r => {
      const cls = classes.value.find(c => c.id === r.class_id)
      return {
        id: r.id,
        experimentName: r.experiment_name,
        className: cls?.name || r.class_id,
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
    reportRows.value.filter(r => (r.status === 'submitted' || r.status === 'resubmitted') && daysSince(r.submittedAt || undefined) >= 2)
  )

  async function loadAll() {
    loading.value = true
    try {
      const [rRes, cRes] = await Promise.all([
        getReports(),
        getMyClasses(),
      ])
      if (rRes.success) reports.value = rRes.reports
      if (cRes.success) {
        classes.value = cRes.classes
        await Promise.all(cRes.classes.map(async (cls) => {
          try {
            const dr = await getClassDetails(cls.id)
            if (dr.success) classStudentsMap.value[cls.id] = dr.students
          } catch { /* ignore */ }
        }))
      }
      if (auth.user) {
        const sRes = await getStudentStats(auth.user.id)
        if (sRes.success) stats.value = sRes.stats
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('student dashboard load failed:', err);
    } finally {
      loading.value = false
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

  let refreshTimer: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    loadAll()
    refreshTimer = setInterval(() => { loadAll() }, 60000)
  })
  onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })

  return {
    reports, classes, classStudentsMap, stats, loading,
    kpi, reportRows, gradedReports, pendingReports, draftReports,
    recentReports, overduePending,
    joinClassByCode, leaveClassById,
    reload: loadAll,
  }
}
