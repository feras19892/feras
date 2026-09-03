import { ref, onMounted, computed, watch } from 'vue'
import { useSchoolStore } from '@/stores/school.store'
import { useToast } from '@/composables/useToast'
import { exportToCSV } from '@/composables/shared/useExport'
import * as schoolApi from '@/services/core/school.api'
import { getSchoolClassDetail, sendSchoolAlert, updateSchoolClass } from '@/services/school.service'
import type { SchoolClass, SchoolClassDetailResult } from '@/services/school.service'
import { useSchoolClassStudents } from './useSchoolClassStudents'

export function useSchoolClasses() {
  const store = useSchoolStore()
  const toast = useToast()
  const students = useSchoolClassStudents()

  const loading = ref(false)
  const error = ref('')
  const activeClass = ref<SchoolClass | null>(null)
  const expandedClass = ref<SchoolClass | null>(null)
  const detailData = ref<SchoolClassDetailResult | null>(null)
  const extraStats = ref({ pendingCount: 0, classAverage: 0 })
  const detailLoading = ref(false)
  const teachers = ref<{ id: number; name: string }[]>([])

  const classes = computed(() => (store.classes as SchoolClass[]))
  const search = ref('')
  const statusFilter = ref('')
  const currentPage = ref(1)
  const pageLimit = ref(10)

  const filteredClasses = computed(() => {
    let result = classes.value
    if (search.value) {
      const q = search.value.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q)) || (c.teacher_name && c.teacher_name.toLowerCase().includes(q)))
    }
    if (statusFilter.value === 'frozen') result = result.filter(c => c.is_frozen)
    if (statusFilter.value === 'active') result = result.filter(c => !c.is_frozen)
    return result
  })

  const pagedClasses = computed(() => {
    const start = (currentPage.value - 1) * pageLimit.value
    return filteredClasses.value.slice(start, start + pageLimit.value)
  })

  watch([search, statusFilter], () => { currentPage.value = 1 })

  function selectClass(c: SchoolClass) {
    if (activeClass.value?.id === c.id) activeClass.value = null
    else activeClass.value = c
  }

  function onActionActive(key: string) {
    if (!activeClass.value) return
    const c = activeClass.value
    if (key === 'detail') {
      if (expandedClass.value?.id === c.id) expandedClass.value = null
      else { expandedClass.value = c; loadDetail(c) }
    } else if (key === 'edit') { editTarget.value = c; editForm.value = { name: c.name, description: c.description || '' } }
    else if (key === 'students') { students.openManageStudents(c) }
    else if (key === 'alert') alertTarget.value = c
    else if (key === 'reassign') { reassignTarget.value = c; reassignTeacherId.value = 0 }
    else if (key === 'freeze') { freezeTarget.value = c; freezeReason.value = ''; showFreezeModal.value = true }
    else if (key === 'unfreeze') unfreezeTarget.value = c
    else if (key === 'activity') openActivity(c.id)
    else if (key === 'delete') deleteTarget.value = c
  }

  async function loadDetail(c: SchoolClass) {
    detailData.value = null
    extraStats.value = { pendingCount: 0, classAverage: 0 }
    detailLoading.value = true
    try {
      const res = await getSchoolClassDetail(c.id)
      if (res.success) {
        detailData.value = res
        const reports = res.reports || []
        const pending = reports.filter(r => r.status !== 'graded').length
        const graded = reports.filter(r => r.grade != null)
        const avg = graded.length ? Math.round(graded.reduce((s, r) => s + (r.grade || 0), 0) / graded.length) : 0
        extraStats.value = { pendingCount: pending, classAverage: avg }
      }
    } catch (e: any) {
      toast.error(e?.message || 'فشل تحميل التفاصيل')
      expandedClass.value = null
    } finally { detailLoading.value = false }
  }

  async function loadTeachers() {
    try {
      const res = await schoolApi.getUsers(1, 200)
      teachers.value = (res.users || []).filter((u: any) => u.role === 'teacher').map((u: any) => ({ id: u.id, name: u.name }))
    } catch (e) { console.error('teachers load error:', e) }
  }

  const showAddModal = ref(false)
  const adding = ref(false)
  const newClass = ref({ name: '', teacherId: 0, description: '' })

  async function handleAddClass() {
    if (!newClass.value.name) return
    adding.value = true
    try {
      await schoolApi.createClass(newClass.value.name, newClass.value.teacherId || undefined, newClass.value.description)
      await load()
      toast.success('تمت إضافة الفصل')
      showAddModal.value = false
      newClass.value = { name: '', teacherId: 0, description: '' }
    } catch (e: any) { toast.error(e?.message || 'فشل الإضافة') }
    finally { adding.value = false }
  }

  const reassignTarget = ref<SchoolClass | null>(null)
  const reassignTeacherId = ref(0)
  const reassignLoading = ref(false)

  async function confirmReassign() {
    if (!reassignTarget.value) return
    reassignLoading.value = true
    try {
      await schoolApi.reassignTeacher(reassignTarget.value.id, reassignTeacherId.value || undefined)
      await load()
      toast.success('تم تعيين المدرس')
      reassignTarget.value = null
    } catch (e: any) { toast.error(e?.message || 'فشل التعيين') }
    finally { reassignLoading.value = false }
  }

  const freezeTarget = ref<SchoolClass | null>(null)
  const freezeReason = ref('')
  const freezeLoading = ref(false)
  const showFreezeModal = ref(false)

  async function confirmFreeze() {
    if (!freezeTarget.value || !freezeReason.value) return
    freezeLoading.value = true
    try {
      await schoolApi.freezeClass(freezeTarget.value.id, freezeReason.value)
      await load()
      toast.success('تم تجميد الفصل')
      showFreezeModal.value = false
      freezeTarget.value = null
    } catch (e: any) { toast.error(e?.message || 'فشل التجميد') }
    finally { freezeLoading.value = false }
  }

  const unfreezeTarget = ref<SchoolClass | null>(null)
  const unfreezeLoading = ref(false)

  async function confirmUnfreeze() {
    if (!unfreezeTarget.value) return
    unfreezeLoading.value = true
    try {
      await schoolApi.unfreezeClass(unfreezeTarget.value.id)
      await load()
      toast.success('تم إلغاء التجميد')
      unfreezeTarget.value = null
    } catch (e: any) { toast.error(e?.message || 'فشل إلغاء التجميد') }
    finally { unfreezeLoading.value = false }
  }

  const deleteTarget = ref<SchoolClass | null>(null)
  const deleteConfirm1 = ref(false)
  const deleteLoading = ref(false)

  async function confirmDelete() {
    if (!deleteTarget.value) return
    deleteLoading.value = true
    try {
      await schoolApi.deleteClass(deleteTarget.value.id)
      await load()
      toast.success('تم حذف الفصل')
      deleteTarget.value = null
      deleteConfirm1.value = false
    } catch (e: any) { toast.error(e?.message || 'فشل الحذف') }
    finally { deleteLoading.value = false }
  }

  const alertTarget = ref<SchoolClass | null>(null)
  const alertLoading = ref(false)
  const alertForm = ref({ title: '', message: '' })

  async function handleAlert() {
    if (!alertTarget.value || !alertForm.value.title) return
    alertLoading.value = true
    try {
      await sendSchoolAlert(alertForm.value.title, alertForm.value.message, 'student', alertTarget.value.id)
      toast.success('تم إرسال التنبيه')
      alertTarget.value = null
      alertForm.value = { title: '', message: '' }
    } catch (e: any) { toast.error(e?.message || 'فشل الإرسال') }
    finally { alertLoading.value = false }
  }

  const activityLogs = ref<any[]>([])
  const activityLoading = ref(false)
  const showActivityModal = ref(false)

  async function openActivity(classId: string) {
    activityLoading.value = true
    showActivityModal.value = true
    try {
      const res = await schoolApi.getClassActivity(classId)
      activityLogs.value = res.logs || []
    } catch (e: any) { toast.error(e?.message || 'فشل تحميل السجل') }
    finally { activityLoading.value = false }
  }

  function handleExport() {
    exportToCSV(classes.value.map(c => ({
      id: c.id, name: c.name, code: c.code, teacher: c.teacher_name || '',
      students: c.student_count, frozen: c.is_frozen ? 'مجمد' : 'نشط', created: formatDate(c.created_at),
    })), 'school-classes')
  }

  function formatDate(d: string | null | undefined) {
    return d ? new Date(d).toLocaleDateString('ar') : '—'
  }

  const editTarget = ref<SchoolClass | null>(null)
  const editForm = ref({ name: '', description: '' })
  const editLoading = ref(false)

  async function confirmEdit() {
    if (!editTarget.value || !editForm.value.name) return
    editLoading.value = true
    try {
      const res = await updateSchoolClass(editTarget.value.id, editForm.value.name, editForm.value.description)
      if (res.success) {
        toast.success('تم تعديل الفصل')
        editTarget.value = null
        await load()
      } else toast.error(res.message || 'فشل التعديل')
    } catch (e: any) { toast.error(e?.message || 'فشل التعديل') }
    finally { editLoading.value = false }
  }

  async function load() {
    loading.value = true
    error.value = ''
    try {
      await store.fetchClasses(true)
    } catch (e: any) { error.value = e?.message || 'فشل التحميل' }
    finally { loading.value = false }
  }

  onMounted(async () => { await load(); await loadTeachers() })

  return {
    ...students,
    loading, error, activeClass, expandedClass, detailData, extraStats, detailLoading, teachers,
    classes, search, statusFilter, currentPage, pageLimit, filteredClasses, pagedClasses,
    selectClass, onActionActive, loadDetail, showAddModal, adding, newClass, handleAddClass,
    reassignTarget, reassignTeacherId, reassignLoading, confirmReassign,
    freezeTarget, freezeReason, freezeLoading, showFreezeModal, confirmFreeze,
    unfreezeTarget, unfreezeLoading, confirmUnfreeze,
    deleteTarget, deleteConfirm1, deleteLoading, confirmDelete,
    alertTarget, alertLoading, alertForm, handleAlert,
    activityLogs, activityLoading, showActivityModal, openActivity,
    handleExport, formatDate,
    editTarget, editForm, editLoading, confirmEdit,
    load,
  }
}
