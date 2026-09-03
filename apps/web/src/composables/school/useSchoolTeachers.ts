import { ref, computed, onMounted, watch } from 'vue'
import { useSchoolStore } from '@/stores/school.store'
import { useToast } from '@/composables/useToast'
import { exportToCSV } from '@/composables/shared/useExport'
import * as schoolApi from '@/services/core/school.api'
import { sendSchoolAlert, getSchoolUserDetail, createSchoolWarning, reportToAdmin, type SchoolUserDetailResult } from '@/services/school.service'
import { getTeacherEvaluation, type TeacherEvaluation } from '@/services/school-reports.service'

export function useSchoolTeachers() {
  const store = useSchoolStore()
  const toast = useToast()

  const loading = ref(false)
  const error = ref('')
  const teachers = ref<TeacherEvaluation[]>([])
  const activeTeacher = ref<TeacherEvaluation | null>(null)
  const expandedTeacher = ref<TeacherEvaluation | null>(null)
  const detailData = ref<SchoolUserDetailResult | null>(null)
  const detailLoading = ref(false)
  const search = ref('')
  const statusFilter = ref('')
  const currentPage = ref(1)
  const pageLimit = ref(10)

  const filteredTeachers = computed(() => {
    let result = teachers.value
    if (search.value) {
      const q = search.value.toLowerCase()
      result = result.filter(t => t.name.toLowerCase().includes(q) || (t.email && t.email.toLowerCase().includes(q)))
    }
    if (statusFilter.value === 'blocked') result = result.filter(t => t.is_blocked)
    if (statusFilter.value === 'active') result = result.filter(t => !t.is_blocked)
    return result
  })

  const pagedTeachers = computed(() => {
    const start = (currentPage.value - 1) * pageLimit.value
    return filteredTeachers.value.slice(start, start + pageLimit.value)
  })

  watch([search, statusFilter], () => { currentPage.value = 1 })

  function selectTeacher(t: TeacherEvaluation) {
    if (activeTeacher.value?.id === t.id) activeTeacher.value = null
    else activeTeacher.value = t
  }

  function onActionActive(key: string) {
    if (activeTeacher.value) onAction(key, activeTeacher.value)
  }

  function onAction(key: string, t: TeacherEvaluation) {
    if (key === 'detail') {
      if (expandedTeacher.value?.id === t.id) expandedTeacher.value = null
      else { expandedTeacher.value = t; loadDetail(t) }
    }
    else if (key === 'warn') warnTarget.value = { id: t.id, name: t.name }
    else if (key === 'report') reportTarget.value = { id: t.id, name: t.name }
    else if (key === 'alert') alertTarget.value = { id: t.id, name: t.name }
    else if (key === 'block') blockTarget.value = { id: t.id, name: t.name }
    else if (key === 'unblock') unblockTarget.value = { id: t.id, name: t.name }
    else if (key === 'delete') deleteTarget.value = { id: t.id, name: t.name }
  }

  async function loadDetail(t: TeacherEvaluation) {
    detailData.value = null
    detailLoading.value = true
    try {
      const res = await getSchoolUserDetail(t.id)
      if (res.success) detailData.value = res
    } catch (e: any) {
      toast.error(e?.message || 'فشل تحميل التفاصيل')
      expandedTeacher.value = null
    } finally { detailLoading.value = false }
  }

  function gradingClass(t: TeacherEvaluation) {
    if (t.grading_rate >= 80) return 'st-rate--good'
    if (t.grading_rate >= 50) return 'st-rate--mid'
    return 'st-rate--bad'
  }
  function scoreClass(t: TeacherEvaluation) {
    if (t.teaching_score >= 70) return 'st-score--good'
    if (t.teaching_score >= 40) return 'st-score--mid'
    return 'st-score--bad'
  }

  const showAddModal = ref(false)
  const adding = ref(false)
  const newUser = ref({ name: '', email: '', password: '' })

  async function handleAddUser() {
    if (!newUser.value.name || !newUser.value.email || !newUser.value.password) return
    adding.value = true
    try {
      await schoolApi.createSchoolUser(newUser.value.name, newUser.value.email, newUser.value.password, 'teacher')
      await load()
      toast.success('تمت إضافة المدرس')
      showAddModal.value = false
      newUser.value = { name: '', email: '', password: '' }
    } catch (e: any) { toast.error(e?.message || 'فشل الإضافة') }
    finally { adding.value = false }
  }

  const warnTarget = ref<{ id: number; name: string } | null>(null)
  const warnLoading = ref(false)
  const warnForm = ref({ title: '', message: '', severity: 'low' })

  async function handleWarn() {
    if (!warnTarget.value || !warnForm.value.title) return
    warnLoading.value = true
    try {
      await createSchoolWarning(warnTarget.value.id, warnForm.value.title, warnForm.value.message, warnForm.value.severity)
      toast.success('تم إرسال التحذير')
      warnTarget.value = null
      warnForm.value = { title: '', message: '', severity: 'low' }
    } catch (e: any) { toast.error(e?.message || 'فشل الإرسال') }
    finally { warnLoading.value = false }
  }

  const reportTarget = ref<{ id: number; name: string } | null>(null)
  const reportLoading = ref(false)
  const reportForm = ref({ reason: '', details: '' })

  async function handleReport() {
    if (!reportTarget.value || !reportForm.value.reason) return
    reportLoading.value = true
    try {
      await reportToAdmin(reportTarget.value.id, reportForm.value.reason, reportForm.value.details)
      toast.success('تم إرسال البلاغ للأدمن')
      reportTarget.value = null
      reportForm.value = { reason: '', details: '' }
    } catch (e: any) { toast.error(e?.message || 'فشل الإرسال') }
    finally { reportLoading.value = false }
  }

  const alertTarget = ref<{ id: number; name: string } | null>(null)
  const alertLoading = ref(false)
  const alertForm = ref({ title: '', message: '' })

  async function handleAlert() {
    if (!alertTarget.value || !alertForm.value.title) return
    alertLoading.value = true
    try {
      await sendSchoolAlert(alertForm.value.title, alertForm.value.message, 'teacher')
      toast.success('تم إرسال التنبيه')
      alertTarget.value = null
      alertForm.value = { title: '', message: '' }
    } catch (e: any) { toast.error(e?.message || 'فشل الإرسال') }
    finally { alertLoading.value = false }
  }

  const blockTarget = ref<{ id: number; name: string } | null>(null)
  const blockConfirm1 = ref(false)
  const blockLoading = ref(false)
  async function confirmBlock() {
    if (!blockTarget.value) return
    blockLoading.value = true
    try {
      await schoolApi.blockUser(blockTarget.value.id)
      await load()
      toast.success('تم حظر المدرس')
      blockTarget.value = null
      blockConfirm1.value = false
    } catch (e: any) { toast.error(e?.message || 'فشل الحظر') }
    finally { blockLoading.value = false }
  }

  const unblockTarget = ref<{ id: number; name: string } | null>(null)
  const unblockLoading = ref(false)
  async function confirmUnblock() {
    if (!unblockTarget.value) return
    unblockLoading.value = true
    try {
      await schoolApi.unblockUser(unblockTarget.value.id)
      await load()
      toast.success('تم إلغاء الحظر')
      unblockTarget.value = null
    } catch (e: any) { toast.error(e?.message || 'فشل إلغاء الحظر') }
    finally { unblockLoading.value = false }
  }

  const deleteTarget = ref<{ id: number; name: string } | null>(null)
  const deleteConfirm1 = ref(false)
  const deleteLoading = ref(false)
  async function confirmDelete() {
    if (!deleteTarget.value) return
    deleteLoading.value = true
    try {
      await schoolApi.removeUser(deleteTarget.value.id)
      await load()
      toast.success('تم حذف المدرس')
      deleteTarget.value = null
      deleteConfirm1.value = false
    } catch (e: any) { toast.error(e?.message || 'فشل الحذف') }
    finally { deleteLoading.value = false }
  }

  function handleExport() {
    exportToCSV(teachers.value.map(t => ({
      id: t.id, name: t.name, email: t.email,
      classes: t.class_count, students: t.total_students,
      reports: t.total_reports, graded: t.graded_reports, pending: t.pending_reports,
      grading_rate: Math.round(t.grading_rate), teaching_score: Math.round(t.teaching_score),
      status: t.is_blocked ? 'محظور' : 'نشط',
    })), 'school-teachers')
  }

  function formatDate(d: string | null | undefined) {
    return d ? new Date(d).toLocaleDateString('ar') : '—'
  }

  async function load() {
    loading.value = true
    error.value = ''
    try {
      await store.fetchUsers()
      const res = await getTeacherEvaluation()
      if (res.success) teachers.value = res.evaluations
    } catch (e: any) { error.value = e?.message || 'فشل التحميل' }
    finally { loading.value = false }
  }

  onMounted(load)

  return {
    loading, error, teachers, activeTeacher, expandedTeacher, detailData, detailLoading,
    search, statusFilter, currentPage, pageLimit, filteredTeachers, pagedTeachers,
    selectTeacher, onActionActive, onAction, loadDetail, gradingClass, scoreClass,
    showAddModal, adding, newUser, handleAddUser,
    warnTarget, warnLoading, warnForm, handleWarn,
    reportTarget, reportLoading, reportForm, handleReport,
    alertTarget, alertLoading, alertForm, handleAlert,
    blockTarget, blockConfirm1, blockLoading, confirmBlock,
    unblockTarget, unblockLoading, confirmUnblock,
    deleteTarget, deleteConfirm1, deleteLoading, confirmDelete,
    handleExport, formatDate, load,
  }
}
