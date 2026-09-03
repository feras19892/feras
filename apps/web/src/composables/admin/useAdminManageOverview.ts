import { ref, onMounted, computed } from 'vue'
import { getAdminInsights, type AdminInsights } from '@/services/admin.service'
import { adminGetAllApprovals, type ApprovalRequest } from '@/services/approval.service'
import { adminGetEmailRequests, adminGetCapacityRequests, type EmailChangeRequest, type CapacityRequest } from '@/services/school.service'
import type { AdminUser, AdminClassItem, AdminReportItem, AdminStats } from '@/services/admin.service'

interface Props {
  users: AdminUser[]
  classes: AdminClassItem[]
  reports: AdminReportItem[]
  stats: AdminStats | null
}

export function useAdminManageOverview(props: Props) {
  const insights = ref<AdminInsights | null>(null)
  const approvals = ref<ApprovalRequest[]>([])
  const emailRequests = ref<EmailChangeRequest[]>([])
  const capacityRequests = ref<CapacityRequest[]>([])
  const loading = ref(true)
  const error = ref('')

  async function loadData() {
    loading.value = true
    error.value = ''
    try {
      const [i, a, er, cr] = await Promise.all([
        getAdminInsights(),
        adminGetAllApprovals(),
        adminGetEmailRequests(),
        adminGetCapacityRequests(),
      ])
      if (i.success) insights.value = i.insights
      if (a.success) approvals.value = a.approvals
      if (er.success) emailRequests.value = er.requests
      if (cr.success) capacityRequests.value = cr.requests
    } catch (err: unknown) {
      error.value = (err instanceof Error ? err.message : '') || 'فشل تحميل البيانات'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadData)

  const pendingApprovals = computed(() => approvals.value.filter(a => a.status === 'pending').length)
  const pendingEmail = computed(() => emailRequests.value.filter(r => r.status === 'pending').length)
  const pendingCapacity = computed(() => capacityRequests.value.filter(r => r.status === 'pending').length)
  const totalPending = computed(() => pendingApprovals.value + pendingEmail.value + pendingCapacity.value)

  const usersByRole = computed(() => {
    if (!props.stats?.users?.byRole) return { admin: 0, teacher: 0, student: 0 }
    const roles = props.stats.users.byRole.reduce((acc, r) => ({ ...acc, [r.role]: r.count }), {} as Record<string, number>)
    return { admin: roles.admin || 0, teacher: roles.teacher || 0, student: roles.student || 0 }
  })

  const pendingReports = computed(() => props.stats?.reports?.pending ?? 0)
  const gradedReports = computed(() => props.stats?.reports?.graded ?? 0)
  const blockedUsers = computed(() => props.users.filter(u => u.blocked_at).length)

  const inactiveUsers = computed(() => insights.value?.inactiveUsers ?? [])
  const emptyClasses = computed(() => insights.value?.emptyClasses ?? [])
  const ungradedCount = computed(() => insights.value?.ungradedCount ?? 0)
  const noReportsTeachers = computed(() => insights.value?.noReportsTeachers ?? [])

  const totalAlerts = computed(() => inactiveUsers.value.length + emptyClasses.value.length + ungradedCount.value + noReportsTeachers.value.length)

  const recentUsers = computed(() =>
    [...props.users]
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 5)
  )

  const recentReports = computed(() =>
    [...props.reports]
      .sort((a, b) => (b.submitted_at || '').localeCompare(a.submitted_at || ''))
      .slice(0, 5)
  )

  function roleLabel(role: string) {
    const labels: Record<string, string> = { admin: 'أدمن', teacher: 'مدرس', student: 'طالب', school: 'مدرسة', parent: 'ولي أمر' }
    return labels[role] || role
  }

  function statusLabel(status: string) {
    const labels: Record<string, string> = { graded: 'مصحح', submitted: 'معلق', resubmitted: 'معاد', draft: 'مسودة' }
    return labels[status] || status
  }

  const manageSections = [
    { id: 'users', icon: '👥', label: 'المستخدمون' },
    { id: 'classes', icon: '📚', label: 'الفصول' },
    { id: 'reports', icon: '📄', label: 'التقارير' },
    { id: 'schools', icon: '🏫', label: 'المدارس' },
    { id: 'requests', icon: '📋', label: 'الطلبات' },
    { id: 'approvals', icon: '✅', label: 'الموافقات' },
  ]

  return {
    loading, error, pendingApprovals, pendingEmail, pendingCapacity, totalPending,
    usersByRole, pendingReports, gradedReports, blockedUsers,
    inactiveUsers, emptyClasses, ungradedCount, noReportsTeachers, totalAlerts,
    recentUsers, recentReports, roleLabel, statusLabel, manageSections,
  }
}
