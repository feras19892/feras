import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getMyClasses, getBatchClassData } from '../../services/class.service'
import type { ClassItem, ClassStudent } from '../../services/class.service'
import { getReports } from '../../services/report.service'
import type { Report } from '../../services/report.service'

export interface DashboardKPI {
  totalClasses: number
  totalStudents: number
  totalReports: number
  pendingCount: number
  unopenedCount: number
  overdueCount: number
  avgGrade: number
  gradedToday: number
  submittedToday: number
}

export interface StudentRow {
  id: number
  name: string
  className: string
  classId: string
  reportCount: number
  gradedCount: number
  pendingCount: number
  avgGrade: number
  lastSubmission: string | null
  missingReports: boolean
}

export interface ClassRow {
  id: string
  name: string
  code: string
  studentCount: number
  totalReports: number
  gradedCount: number
  pendingCount: number
  classAverage: number
  isFrozen: boolean
}

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 999
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

interface ClassStats {
  student_count: number
  total_reports: number
  graded_count: number
  pending_count: number
  class_average: number
  top_students: { student_id: number; avg: number; report_count: number }[]
}

export function useTeacherDashboard() {
  const classes = ref<ClassItem[]>([])
  const allReports = ref<Report[]>([])
  const loading = ref(false)
  const classStatsMap = ref<Record<string, ClassStats>>({})
  const classStudentsMap = ref<Record<string, ClassStudent[]>>({})

  const kpi = computed<DashboardKPI>(() => {
    let totalStudents = 0, totalReports = 0, avgAccum = 0, avgCount = 0
    let gradedToday = 0, submittedToday = 0, unopenedCount = 0, overdueCount = 0

    for (const key in classStatsMap.value) {
      const s = classStatsMap.value[key]
      if (!s) continue
      totalStudents += s.student_count
      totalReports += s.total_reports
      if (s.class_average > 0) { avgAccum += s.class_average; avgCount++ }
    }

    for (const r of allReports.value) {
      if (isToday(r.submitted_at)) submittedToday++
      if (isToday(r.graded_at)) gradedToday++
      if (!r.teacher_seen && r.status !== 'draft') unopenedCount++
      if ((r.status === 'submitted' || r.status === 'resubmitted') && r.submitted_at && daysSince(r.submitted_at) >= 2) overdueCount++
    }

    return {
      totalClasses: classes.value.length,
      totalStudents,
      totalReports,
      pendingCount: allReports.value.filter(r => r.status === 'submitted' || r.status === 'resubmitted').length,
      unopenedCount,
      overdueCount,
      avgGrade: avgCount ? Math.round(avgAccum / avgCount) : 0,
      gradedToday,
      submittedToday,
    }
  })

  const classRows = computed<ClassRow[]>(() => {
    return classes.value.map(cls => {
      const s = classStatsMap.value[cls.id]
      return {
        id: cls.id,
        name: cls.name,
        code: cls.code,
        studentCount: s?.student_count || 0,
        totalReports: s?.total_reports || 0,
        gradedCount: s?.graded_count || 0,
        pendingCount: s?.pending_count || 0,
        classAverage: s?.class_average || 0,
        isFrozen: !!cls.is_frozen,
      }
    })
  })

  const studentRows = computed<StudentRow[]>(() => {
    const map: Record<number, StudentRow> = {}
    for (const cls of classes.value) {
      const students = classStudentsMap.value[cls.id] || []
      for (const st of students) {
        if (!map[st.id]) {
          map[st.id] = {
            id: st.id, name: st.name, className: cls.name, classId: cls.id,
            reportCount: 0, gradedCount: 0, pendingCount: 0, avgGrade: 0,
            lastSubmission: null, missingReports: false,
          }
        }
      }
    }
    for (const r of allReports.value) {
      const row = map[r.student_id]
      if (!row) continue
      row.reportCount++
      if (r.status === 'graded') { row.gradedCount++; row.avgGrade += r.grade || 0 }
      if (r.status === 'submitted' || r.status === 'resubmitted') row.pendingCount++
      if (!row.lastSubmission || (r.submitted_at || '') > (row.lastSubmission || '')) {
        row.lastSubmission = r.submitted_at || null
      }
    }
    for (const id in map) {
      const row = map[id]
      if (row.gradedCount > 0) row.avgGrade = Math.round(row.avgGrade / row.gradedCount)
      row.missingReports = row.reportCount === 0
    }
    return Object.values(map).sort((a, b) => b.reportCount - a.reportCount)
  })

  const todayUnopened = computed(() =>
    allReports.value
      .filter(r => !r.teacher_seen && r.status !== 'draft')
      .sort((a, b) => (b.submitted_at || '').localeCompare(a.submitted_at || ''))
  )

  const overdueUngraded = computed(() =>
    allReports.value
      .filter(r => (r.status === 'submitted' || r.status === 'resubmitted') && r.submitted_at && daysSince(r.submitted_at) >= 2)
      .sort((a, b) => (a.submitted_at || '').localeCompare(b.submitted_at || ''))
  )

  async function loadAll() {
    loading.value = true
    try {
      const [clsRes, batchRes, rRes] = await Promise.all([
        getMyClasses(),
        getBatchClassData(),
        getReports(),
      ])
      if (clsRes.success) classes.value = clsRes.classes
      if (batchRes.success) {
        classStatsMap.value = batchRes.statsMap
        classStudentsMap.value = batchRes.studentsMap
      }
      if (rRes.success) allReports.value = rRes.reports
    } catch (err) {
      if (import.meta.env.DEV) console.error('dashboard load failed:', err);
    } finally {
      loading.value = false
    }
  }

  let refreshTimer: ReturnType<typeof setInterval> | null = null
  onMounted(() => {
    loadAll()
    refreshTimer = setInterval(() => { if (document.visibilityState === 'visible') loadAll() }, 300000)
  })
  onUnmounted(() => { if (refreshTimer) clearInterval(refreshTimer) })

  return {
    classes, allReports, loading, classStatsMap,
    kpi, classRows, studentRows, todayUnopened, overdueUngraded,
    reload: loadAll,
  }
}
