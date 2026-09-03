import { ref, computed, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useToast } from '@/composables/useToast'
import { getAdminReports, getAdminReportFilters, getAdminReportsAnalytics, updateAdminReportGrade, deleteAdminReports, reassignReport, getAdminTeachers, type AdminReportItem, type AdminReportFilterOptions, type AdminReportsAnalytics } from '@/services/admin.service'
import { exportToCSV } from '@/composables/shared/useExport'
import { eventBus } from '@/composables/shared/useEventBus'
import { useSelectedUser } from '@/composables/shared/useSelectedUser'
import { useSelectedClass } from '@/composables/shared/useSelectedClass'
import { useSelectedSchool } from '@/composables/shared/useSelectedSchool'

export function useAdminReportsAnalytics() {
  const { t } = useI18n()
  const toast = useToast()
  const { setSelectedUser } = useSelectedUser()
  const { setSelectedClass } = useSelectedClass()
  const { setSelectedSchool } = useSelectedSchool()

  const reports = ref<AdminReportItem[]>([])
  const totalReports = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const search = ref('')
  const statusFilter = ref('')
  const filters = ref<Record<string, string>>({})
  const filterOptions = ref<AdminReportFilterOptions>({ schools: [], classes: [], teachers: [], experiments: [] })
  const analytics = ref<AdminReportsAnalytics | null>(null)
  const currentPage = ref(1)
  const pageLimit = ref(10)
  const selected = ref<AdminReportItem | null>(null)
  const grade = ref(0)
  const feedback = ref('')
  const submitting = ref(false)
  const deleteTarget = ref<number[]>([])
  const deleteLoading = ref(false)
  const reassignTarget = ref<AdminReportItem | null>(null)
  const reassignTeacherId = ref<number | string>(0)
  const reassigning = ref(false)
  const teachers = ref<{ id: number; name: string }[]>([])
  const selectedReports = ref<number[]>([])
  const detailId = ref<number | null>(null)

  const totalPages = computed(() => Math.ceil(totalReports.value / pageLimit.value) || 1)
  const overdueReports = computed(() => reports.value.filter(r => {
    if (r.status !== 'submitted' && r.status !== 'resubmitted') return false
    if (!r.submitted_at) return false
    return (Date.now() - new Date(r.submitted_at).getTime()) / 86400000 > 3
  }))
  const overdueCount = computed(() => overdueReports.value.length)

  const filteredReports = computed(() => reports.value)
  const pagedReports = computed(() => filteredReports.value)

  const selectedCount = computed(() => selectedReports.value.length)
  const selectedItems = computed(() => filteredReports.value.filter(r => selectedReports.value.includes(r.id)))
  const firstSelected = computed(() => selectedItems.value[0])
  const isAllSelected = computed(() => pagedReports.value.length > 0 && pagedReports.value.every(r => selectedReports.value.includes(r.id)))
  const deleteMessage = computed(() => deleteTarget.value.length > 1 ? t('dashboard.dashNew.deleteNReports', { n: deleteTarget.value.length }) : t('dashboard.dashNew.deleteReportMsg'))

  function toggleReport(id: number, e?: Event) {
    if (e) e.stopPropagation()
    const idx = selectedReports.value.indexOf(id)
    if (idx >= 0) selectedReports.value.splice(idx, 1)
    else selectedReports.value.push(id)
  }

  function toggleSelectAll() {
    const ids = pagedReports.value.map(r => r.id)
    if (isAllSelected.value) selectedReports.value = selectedReports.value.filter(id => !ids.includes(id))
    else selectedReports.value = Array.from(new Set([...selectedReports.value, ...ids]))
  }

  function openDetail(r: AdminReportItem) { detailId.value = r.id }
  function closeDetail() { detailId.value = null }

  function openGradeFromDetail() { const r = reports.value.find(x => x.id === detailId.value); if (r) openGrading(r) }
  function openReassignFromDetail() { const r = reports.value.find(x => x.id === detailId.value); if (r) openReassign(r) }
  function deleteFromDetail() { const id = detailId.value; if (id) { closeDetail(); handleDelete([id]) } }

  async function onFilterChange(values: Record<string, string>, searchVal: string) {
    filters.value = values
    statusFilter.value = values.status || ''
    search.value = searchVal
    currentPage.value = 1
    await load()
  }

  function onPageChange(p: number) { currentPage.value = p; load() }

  function statusLabel(s: string) {
    const labels: Record<string, string> = { draft: t('dashboard.dashNew.statusDraft'), submitted: t('dashboard.dashNew.statusSubmitted'), graded: t('dashboard.dashNew.statusGraded'), resubmitted: t('dashboard.dashNew.statusResubmitted') }
    return labels[s] || s
  }

  function gradeSelected() { if (firstSelected.value) openGrading(firstSelected.value) }
  function reassignSelected() { if (firstSelected.value) openReassign(firstSelected.value) }
  function deleteSelected() { deleteTarget.value = [...selectedReports.value] }

  async function exportSelected() {
    const rows = selectedCount.value ? selectedItems.value : filteredReports.value
    exportToCSV(rows.map(r => ({
      'ID': r.id,
      'التجربة': r.experiment_name,
      'الطالب': r.student_name,
      'الفصل': r.class_name,
      'المدرس': r.teacher_name,
      'الحالة': statusLabel(r.status),
      'الدرجة': r.grade ?? '',
      'تاريخ التسليم': r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('ar') : '',
    })), 'admin-reports')
  }

  function openGrading(r: AdminReportItem) { selected.value = r; grade.value = r.grade ?? 0; feedback.value = '' }
  function closeGrading() { selected.value = null; grade.value = 0; feedback.value = '' }

  async function submitGrade() {
    if (!selected.value) return
    const targets = selectedReports.value.length > 1 ? selectedItems.value : [selected.value]
    if (!targets.length) return
    submitting.value = true
    try {
      for (const r of targets) {
        await updateAdminReportGrade(r.id, grade.value, feedback.value)
      }
      toast.success(targets.length > 1 ? t('dashboard.dashNew.reportsGraded', { n: targets.length }) : t('dashboard.dashNew.gradeSaved'))
      closeGrading()
      selectedReports.value = []
      await load()
    } catch (e: any) { toast.error(e?.message || t('dashboard.dashNew.gradeSaveFailed')) } finally { submitting.value = false }
  }

  function handleDelete(ids: number[]) { deleteTarget.value = ids }

  async function confirmDelete() {
    const ids = deleteTarget.value
    if (!ids.length) return
    deleteLoading.value = true
    try {
      await deleteAdminReports(ids)
      toast.success(ids.length > 1 ? t('dashboard.dashNew.reportsDeleted') : t('dashboard.dashNew.reportDeleted'))
      selectedReports.value = selectedReports.value.filter(id => !ids.includes(id))
      deleteTarget.value = []
      await load()
    } catch (e: any) { toast.error(e?.message || t('dashboard.dashNew.reportDeleteFailed')) } finally { deleteLoading.value = false }
  }

  async function ensureTeachers() {
    if (teachers.value.length) return
    try {
      const tRes = await getAdminTeachers()
      teachers.value = tRes.teachers || []
    } catch { /* silent */ }
  }

  function openReassign(r: AdminReportItem) {
    reassignTarget.value = r
    reassignTeacherId.value = ''
    ensureTeachers()
  }

  function closeReassign() { reassignTarget.value = null; reassignTeacherId.value = 0 }

  async function confirmReassign() {
    if (!reassignTarget.value || !reassignTeacherId.value) return
    const targets = selectedReports.value.length > 1 ? selectedItems.value : [reassignTarget.value]
    if (!targets.length) return
    reassigning.value = true
    try {
      for (const r of targets) {
        await reassignReport(r.id, Number(reassignTeacherId.value))
      }
      toast.success(targets.length > 1 ? t('dashboard.dashNew.reportsReassigned', { n: targets.length }) : t('dashboard.dashNew.reportReassigned'))
      closeReassign()
      selectedReports.value = []
      await load()
    } catch (e: any) { toast.error(e?.message || t('dashboard.dashNew.reportReassignFailed')) } finally { reassigning.value = false }
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const res = await getAdminReports({ page: currentPage.value, limit: pageLimit.value, search: search.value, ...filters.value })
      reports.value = res.reports || []
      totalReports.value = res.total || 0
    } catch (e: any) { error.value = e?.message || t('dashboard.dashNew.reportsLoadFailed') } finally { loading.value = false }
  }

  async function loadFilterOptions() {
    try {
      const res = await getAdminReportFilters()
      filterOptions.value = { ...filterOptions.value, ...res }
    } catch { /* silent */ }
  }

  async function loadAnalytics() {
    try {
      const res = await getAdminReportsAnalytics()
      if (res.success) analytics.value = res.analytics
    } catch { /* silent */ }
  }

  onMounted(async () => {
    await loadFilterOptions()
    await Promise.all([load(), loadAnalytics()])
  })

  function goToStudent(id: number) { setSelectedUser(id); eventBus.emit('admin:switch-tab', { tabId: 'user-detail' }) }
  function goToTeacher(id: number) { setSelectedUser(id); eventBus.emit('admin:switch-tab', { tabId: 'user-detail' }) }
  function goToClass(id: string) { setSelectedClass(id); eventBus.emit('admin:switch-tab', { tabId: 'class-detail' }) }
  function goToSchool(id: number) { setSelectedSchool(id); eventBus.emit('admin:switch-tab', { tabId: 'school-detail' }) }

  return {
    t, reports, totalReports, loading, error, search, filters, filterOptions, statusFilter, currentPage, pageLimit, selected, grade, feedback,
    submitting, deleteTarget, deleteLoading, reassignTarget, reassignTeacherId, reassigning, teachers,
    selectedReports, detailId, overdueCount, filteredReports, pagedReports, selectedCount, totalPages,
    selectedItems, firstSelected, isAllSelected, deleteMessage, toggleReport, toggleSelectAll, openDetail,
    closeDetail, openGradeFromDetail, openReassignFromDetail, deleteFromDetail, onFilterChange, onPageChange,
    statusLabel, gradeSelected, reassignSelected, deleteSelected, exportSelected, openGrading, closeGrading,
    submitGrade, handleDelete, confirmDelete, openReassign, closeReassign, confirmReassign, load, analytics,
    goToStudent, goToTeacher, goToClass, goToSchool,
  }
}
