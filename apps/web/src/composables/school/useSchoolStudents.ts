import { ref, computed, onMounted, watch } from 'vue'
import { useSchoolStore } from '@/stores/school.store'
import { useToast } from '@/composables/useToast'
import { exportToCSV } from '@/composables/shared/useExport'
import * as schoolApi from '@/services/core/school.api'
import { sendSchoolAlert, getSchoolUserDetail, createSchoolWarning, reportToAdmin, type SchoolUserDetailResult } from '@/services/school.service'
import { getStudentEvaluation, type StudentEvaluation } from '@/services/school-reports.service'

export function useSchoolStudents() {
  const store = useSchoolStore()
  const toast = useToast()

  const loading = ref(false)
  const error = ref('')
  const students = ref<StudentEvaluation[]>([])
  const activeStudent = ref<StudentEvaluation | null>(null)
  const expandedStudent = ref<StudentEvaluation | null>(null)
  const detailData = ref<SchoolUserDetailResult | null>(null)
  const detailLoading = ref(false)
  const search = ref('')
  const statusFilter = ref('')
  const currentPage = ref(1)
  const pageLimit = ref(10)

  const filteredStudents = computed(() => {
    let result = students.value
    if (search.value) {
      const q = search.value.toLowerCase()
      result = result.filter(s => s.name.toLowerCase().includes(q) || (s.email && s.email.toLowerCase().includes(q)))
    }
    if (statusFilter.value === 'blocked') result = result.filter(s => s.is_blocked)
    if (statusFilter.value === 'active') result = result.filter(s => !s.is_blocked)
    return result
  })

  const pagedStudents = computed(() => {
    const start = (currentPage.value - 1) * pageLimit.value
    return filteredStudents.value.slice(start, start + pageLimit.value)
  })

  watch([search, statusFilter], () => { currentPage.value = 1 })

  function selectStudent(s: StudentEvaluation) {
    if (activeStudent.value?.id === s.id) activeStudent.value = null
    else activeStudent.value = s
  }

  function onActionActive(key: string) {
    if (activeStudent.value) onAction(key, activeStudent.value)
  }

  function onAction(key: string, s: StudentEvaluation) {
    if (key === 'detail') {
      if (expandedStudent.value?.id === s.id) expandedStudent.value = null
      else { expandedStudent.value = s; loadDetail(s) }
    }
    else if (key === 'warn') warnTarget.value = { id: s.id, name: s.name }
    else if (key === 'report') reportTarget.value = { id: s.id, name: s.name }
    else if (key === 'alert') alertTarget.value = { id: s.id, name: s.name }
    else if (key === 'block') blockTarget.value = { id: s.id, name: s.name }
    else if (key === 'unblock') unblockTarget.value = { id: s.id, name: s.name }
    else if (key === 'delete') deleteTarget.value = { id: s.id, name: s.name }
  }

  async function loadDetail(s: StudentEvaluation) {
    detailData.value = null
    detailLoading.value = true
    try {
      const res = await getSchoolUserDetail(s.id)
      if (res.success) detailData.value = res
    } catch (e: any) {
      toast.error(e?.message || 'فشل تحميل التفاصيل')
      expandedStudent.value = null
    } finally { detailLoading.value = false }
  }

  function gradingClass(s: StudentEvaluation) {
    if (s.grading_rate >= 80) return 'st-rate--good'
    if (s.grading_rate >= 50) return 'st-rate--mid'
    return 'st-rate--bad'
  }
  function scoreClass(s: StudentEvaluation) {
    if (s.student_score >= 70) return 'st-score--good'
    if (s.student_score >= 40) return 'st-score--mid'
    return 'st-score--bad'
  }

  const showAddModal = ref(false)
  const adding = ref(false)
  const newUser = ref({ name: '', email: '', password: '' })

  async function handleAddUser() {
    if (!newUser.value.name || !newUser.value.email || !newUser.value.password) return
    adding.value = true
    try {
      await schoolApi.createSchoolUser(newUser.value.name, newUser.value.email, newUser.value.password, 'student')
      await load()
      toast.success('تمت إضافة الطالب')
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
      await sendSchoolAlert(alertForm.value.title, alertForm.value.message, 'student')
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
      toast.success('تم حظر الطالب')
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
      toast.success('تم حذف الطالب')
      deleteTarget.value = null
      deleteConfirm1.value = false
    } catch (e: any) { toast.error(e?.message || 'فشل الحذف') }
    finally { deleteLoading.value = false }
  }

  function handleExport() {
    exportToCSV(students.value.map(s => ({
      id: s.id, name: s.name, email: s.email,
      classes: s.class_count, reports: s.total_reports, graded: s.graded_reports, pending: s.pending_reports,
      grading_rate: Math.round(s.grading_rate), avg_grade: Math.round(s.avg_grade), quiz_submissions: s.quiz_submissions,
      badges: s.badge_count, score: Math.round(s.student_score), status: s.is_blocked ? 'محظور' : 'نشط',
    })), 'school-students')
  }

  function formatDate(d: string | null | undefined) {
    return d ? new Date(d).toLocaleDateString('ar') : '—'
  }

  async function load() {
    loading.value = true
    error.value = ''
    try {
      await store.fetchUsers()
      const res = await getStudentEvaluation()
      if (res.success) students.value = res.evaluations
    } catch (e: any) { error.value = e?.message || 'فشل التحميل' }
    finally { loading.value = false }
  }

  onMounted(load)

  return {
    loading, error, students, activeStudent, expandedStudent, detailData, detailLoading,
    search, statusFilter, currentPage, pageLimit, filteredStudents, pagedStudents,
    selectStudent, onActionActive, onAction, loadDetail, gradingClass, scoreClass,
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
