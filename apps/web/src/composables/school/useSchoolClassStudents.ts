import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { getSchoolClassDetail, getSchoolUsers, addStudentToSchoolClass, removeStudentFromSchoolClass } from '@/services/school.service'
import type { SchoolClass, SchoolClassDetailResult, SchoolUser } from '@/services/school.service'

export function useSchoolClassStudents() {
  const toast = useToast()

  const manageStudentsTarget = ref<SchoolClass | null>(null)
  const manageStudentsLoading = ref(false)
  const allStudents = ref<SchoolUser[]>([])
  const selectedAddStudent = ref(0)
  const addStudentLoading = ref(false)
  const removeStudentLoading = ref<number | null>(null)
  const manageDetail = ref<SchoolClassDetailResult | null>(null)

  const classStudents = computed(() => manageDetail.value?.students || [])
  const availableStudents = computed(() => {
    const inClass = new Set(classStudents.value.map(s => s.id))
    return allStudents.value.filter(s => s.role === 'student' && !inClass.has(s.id) && !s.blocked_at)
  })

  async function openManageStudents(c: SchoolClass) {
    manageStudentsLoading.value = true
    manageDetail.value = null
    selectedAddStudent.value = 0
    manageStudentsTarget.value = c
    try {
      const [detailRes, usersRes] = await Promise.all([getSchoolClassDetail(c.id), getSchoolUsers(1, 200)])
      if (detailRes.success) manageDetail.value = detailRes
      if (usersRes.success) allStudents.value = usersRes.users || []
    } catch (e: any) { toast.error(e?.message || 'فشل التحميل') }
    finally { manageStudentsLoading.value = false }
  }

  async function addStudent() {
    if (!manageStudentsTarget.value || !selectedAddStudent.value) return
    addStudentLoading.value = true
    try {
      const res = await addStudentToSchoolClass(manageStudentsTarget.value.id, selectedAddStudent.value)
      if (res.success) {
        toast.success('تمت إضافة الطالب')
        selectedAddStudent.value = 0
        await openManageStudents(manageStudentsTarget.value)
      } else toast.error(res.message || 'فشل الإضافة')
    } catch (e: any) { toast.error(e?.message || 'فشل الإضافة') }
    finally { addStudentLoading.value = false }
  }

  async function removeStudent(studentId: number) {
    if (!manageStudentsTarget.value) return
    removeStudentLoading.value = studentId
    try {
      const res = await removeStudentFromSchoolClass(manageStudentsTarget.value.id, studentId)
      if (res.success) {
        toast.success('تمت إزالة الطالب')
        await openManageStudents(manageStudentsTarget.value)
      } else toast.error(res.message || 'فشل الإزالة')
    } catch (e: any) { toast.error(e?.message || 'فشل الإزالة') }
    finally { removeStudentLoading.value = null }
  }

  return {
    manageStudentsTarget, manageStudentsLoading, allStudents, selectedAddStudent,
    addStudentLoading, removeStudentLoading, manageDetail, classStudents, availableStudents,
    openManageStudents, addStudent, removeStudent,
  }
}
