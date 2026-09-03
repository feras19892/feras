import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useToast } from '../composables/useToast'
import { useAdminUserActions } from '../composables/admin-user-actions'
import {
  getAdminUsers, getAdminStats, getAdminClasses, getAdminReports, getAdminFeedback,
  getDetailedStats, getAcademicTracking, getAdminSystemHealth, getAdminInsights,
  type AdminUser, type AdminClassItem, type AdminReportItem, type AdminFeedbackItem, type AdminStats,
} from '../services/admin.service'
import * as adminApi from '@/services/core/admin.api'
import type {
  DetailedStats, AcademicTracking, SystemHealth, Insights, TimePeriod,
} from '../types/admin-dashboard'

const STALE_MS = 60_000

export const useAdminStore = defineStore('admin-dashboard', () => {
  const { t } = useI18n()
  const toast = useToast()

  const users = ref<AdminUser[]>([])
  const classes = ref<AdminClassItem[]>([])
  const reports = ref<AdminReportItem[]>([])
  const feedback = ref<AdminFeedbackItem[]>([])
  const stats = ref<AdminStats | null>(null)
  const detailed = ref<DetailedStats | null>(null)
  const academic = ref<AcademicTracking | null>(null)
  const health = ref<SystemHealth | null>(null)
  const insights = ref<Insights | null>(null)
  const schools = ref<adminApi.AdminSchool[]>([])
  const requests = ref<adminApi.ApprovalRequest[]>([])
  const loading = ref(false)
  const dashLoading = ref(false)
  const errorMsg = ref('')

  const userSearch = ref('')
  const userPage = ref(1)
  const classSearch = ref('')
  const reportSearch = ref('')
  const reportPage = ref(1)
  const reportStatusFilter = ref('all')
  const timePeriod = ref<TimePeriod>('all')

  let loadPromise: Promise<void> | null = null
  let dashPromise: Promise<void> | null = null
  let lastLoad = 0
  let lastDashLoad = 0

  async function loadAll(force = false): Promise<void> {
    if (loadPromise && !force) return loadPromise
    if (!force && Date.now() - lastLoad < STALE_MS && users.value.length > 0) return
    loading.value = true
    errorMsg.value = ''
    loadPromise = (async () => {
      try {
        const [u, s, c, r, f] = await Promise.allSettled([
          getAdminUsers(), getAdminStats(), getAdminClasses(), getAdminReports(), getAdminFeedback(),
        ])
        if (u.status === 'fulfilled' && u.value.success) users.value = u.value.users
        if (s.status === 'fulfilled' && s.value.success) stats.value = s.value.stats
        if (c.status === 'fulfilled' && c.value.success) classes.value = c.value.classes
        if (r.status === 'fulfilled' && r.value.success) reports.value = r.value.reports
        if (f.status === 'fulfilled' && f.value.success) feedback.value = f.value.feedback
        lastLoad = Date.now()
      } catch (err: unknown) {
        errorMsg.value = (err instanceof Error ? err.message : '') || t('admin.loadError')
        toast.error(errorMsg.value)
      } finally {
        loading.value = false
        loadPromise = null
      }
    })()
    return loadPromise
  }

  async function loadDashboard(force = false): Promise<void> {
    if (dashPromise && !force) return dashPromise
    if (!force && Date.now() - lastDashLoad < STALE_MS && detailed.value) return
    dashLoading.value = true
    dashPromise = (async () => {
      try {
        const [d, a, h, i] = await Promise.allSettled([
          getDetailedStats(timePeriod.value),
          getAcademicTracking(),
          getAdminSystemHealth(),
          getAdminInsights(),
        ])
        if (d.status === 'fulfilled' && d.value.success) detailed.value = d.value.stats as unknown as DetailedStats
        if (a.status === 'fulfilled' && a.value.success) academic.value = a.value.tracking as unknown as AcademicTracking
        if (h.status === 'fulfilled' && h.value.success) health.value = h.value.health as unknown as SystemHealth
        if (i.status === 'fulfilled' && i.value.success) insights.value = i.value.insights as unknown as Insights
        lastDashLoad = Date.now()
      } catch {
        toast.error(t('admin.loadError'))
      } finally {
        dashLoading.value = false
        dashPromise = null
      }
    })()
    return dashPromise
  }

  const {
    handleRemoveUser,
    handleBulkDelete,
    handleChangeRole,
    handleBulkChangeRole,
    handleAddUser,
    handleRemoveClass,
    banUser,
    unbanUser,
  } = useAdminUserActions(users, classes, loadAll)
  const usersByRole = computed(() => {
    if (!stats.value?.users?.byRole) return { admin: 0, teacher: 0, student: 0 }
    const roles = stats.value.users.byRole.reduce((acc, r) => ({ ...acc, [r.role]: r.count }), {} as Record<string, number>)
    return { admin: roles.admin || 0, teacher: roles.teacher || 0, student: roles.student || 0 }
  })

  const topSchools = computed(() => {
    if (!detailed.value?.top_schools) return []
    return detailed.value.top_schools.slice(0, 5).map(s => ({
      id: s.id, name: s.name,
      meta: `${s.report_count} ${t('adminUser.reportsCount')} • ${s.user_count} ${t('adminUser.usersCount')}`,
    }))
  })

  const topClasses = computed(() => {
    if (!detailed.value?.top_classes) return []
    return detailed.value.top_classes.slice(0, 5).map(c => ({
      id: c.id, name: c.name,
      meta: `${c.teacher_name} • ${c.report_count} ${t('adminUser.reportsCount')}`,
    }))
  })

  const completionRate = computed(() => {
    if (!detailed.value) return 0
    const { graded, reports } = detailed.value.totals
    return !reports ? 0 : Math.round((graded / reports) * 100)
  })

  const gradingRate = computed(() => {
    if (!detailed.value) return 0
    const { graded, pending } = detailed.value.totals
    const denom = graded + pending
    return !denom ? 0 : Math.round((graded / denom) * 100)
  })

  const activityRate = computed(() => {
    if (!detailed.value) return 0
    const { active_users, users } = detailed.value.totals
    return !users ? 0 : Math.round((active_users / users) * 100)
  })

  const systemStatus = computed(() => {
    if (!health.value) return { ok: false, label: t('admin.systemLoading'), cls: 'inactive' }
    const sessions = health.value.counts.sessions || 0
    return sessions > 0
      ? { ok: true, label: t('admin.systemRunning'), cls: 'success' }
      : { ok: true, label: t('admin.systemRunningIdle'), cls: 'success' }
  })

  const totalAlerts = computed(() => {
    if (!insights.value) return 0
    return (insights.value.inactiveUsers?.length ?? 0) +
      (insights.value.emptyClasses?.length ?? 0) +
      (insights.value.ungradedCount ? 1 : 0) +
      (insights.value.noReportsTeachers?.length ?? 0)
  })

  const hasAlerts = computed(() => totalAlerts.value > 0)
  const recentActivityList = computed(() => insights.value?.recentActivity ?? [])
  const healthTables = computed(() => {
    if (!health.value?.tables) return []
    return Object.entries(health.value.tables)
      .filter(([name]) => !name.startsWith('sqlite_'))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  })

  const totalUsers = computed(() => stats.value?.users?.total ?? 0)
  const totalSchools = computed(() => detailed.value?.totals?.schools ?? 0)
  const pendingUsers = computed(() => users.value.filter((u: any) => !u.email_verified_at))
  const activeSchools = computed(() => schools.value)

  async function fetchOverview() { await loadAll() }
  async function fetchUsers() { await loadAll() }
  async function fetchSchools() {
    dashLoading.value = true
    try {
      const res = await adminApi.getSchools()
      if (res.success) schools.value = res.schools
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : '') || t('admin.loadError'))
    } finally {
      dashLoading.value = false
    }
  }
  async function fetchRequests() {
    try {
      const res = await adminApi.getRequests()
      if (res.success) requests.value = res.requests
    } catch { /* silent */ }
  }
  async function fetchSystemStatus() { await loadDashboard() }

  return {
    users, classes, reports, feedback, stats, detailed, academic, health, insights,
    schools,
    requests,
    loading, dashLoading, errorMsg,
    userSearch, userPage, classSearch, reportSearch, reportPage, reportStatusFilter, timePeriod,
    loadAll, loadDashboard,
    handleRemoveUser, handleBulkDelete, handleChangeRole, handleBulkChangeRole,
    handleAddUser, handleRemoveClass, banUser, unbanUser,
    usersByRole, topSchools, topClasses, completionRate, gradingRate, activityRate,
    systemStatus, totalAlerts, hasAlerts, recentActivityList, healthTables,
    totalUsers, totalSchools, pendingUsers, activeSchools,
    fetchOverview, fetchUsers, fetchSchools, fetchRequests, fetchSystemStatus,
  }
})
