import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTeacherStore } from '@/stores/teacher.store'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useToast } from '@/composables/useToast'
import * as teacherApi from '@/services/core/teacher.api'
import type { TeacherClass } from '@/services/core/teacher.api'
import { eventBus } from '@/composables/shared/useEventBus'

export function useTeacherClasses() {
  const store = useTeacherStore()
  const auth = useAuthStore()
  const toast = useToast()
  const teacherName = computed(() => auth.user?.name || 'مدرس')
  const showCreate = ref(false)
  const creating = ref(false)
  const activeClass = ref<TeacherClass | null>(null)
  const expandedClass = ref<TeacherClass | null>(null)
  const removingStudent = ref<number | null>(null)
  const removeTarget = ref<number | null>(null)
  const renameTarget = ref<TeacherClass | null>(null)
  const renaming = ref(false)
  const deleteTarget = ref<TeacherClass | null>(null)
  const deleting = ref(false)
  const deleteConfirm1 = ref(false)
  const studentProfileOpen = ref(false)
  const studentProfileClassId = ref<string | null>(null)
  const studentProfileStudentId = ref<number | null>(null)
  const showBroadcast = ref(false)

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('تم نسخ الكود')
    } catch {
      toast.error('فشل نسخ الكود')
    }
  }

  function openStudentProfile(classId: string, studentId: number) {
    studentProfileClassId.value = classId
    studentProfileStudentId.value = studentId
    studentProfileOpen.value = true
  }

  function selectClass(cls: TeacherClass) {
    if (activeClass.value?.id === cls.id) activeClass.value = null
    else activeClass.value = cls
  }

  function onActionActive(key: string) {
    if (activeClass.value) onAction(key, activeClass.value)
  }

  function onAction(key: string, cls: TeacherClass) {
    if (key === 'view') {
      if (expandedClass.value?.id === cls.id) expandedClass.value = null
      else expandedClass.value = cls
    }
    else if (key === 'rename') { renameTarget.value = cls }
    else if (key === 'regenerate-code') { handleRegenerateCode(cls) }
    else if (key === 'toggle-freeze') { handleToggleFreeze(cls) }
    else if (key === 'delete') { deleteTarget.value = cls }
  }

  async function handleToggleFreeze(cls: TeacherClass) {
    try {
      const frozen = !!cls.is_frozen
      const res = await teacherApi.updateClass(cls.id, { is_frozen: !frozen })
      if (res.success) {
        toast.success(frozen ? 'تم إلغاء تجميد الفصل' : 'تم تجميد الفصل')
        await store.fetchClasses(true)
        eventBus.emit('class:updated', { classId: cls.id })
      } else {
        toast.error(res.message || 'فشلت العملية')
      }
    } catch (e: any) { toast.error(e?.message || 'فشلت العملية') }
  }

  async function handleRegenerateCode(cls: TeacherClass) {
    try {
      const res = await teacherApi.regenerateCode(cls.id)
      if (res.success && res.code) {
        toast.success(`الكود الجديد: ${res.code}`)
        await store.fetchClasses(true)
      } else toast.error(res.message || 'فشل توليد كود جديد')
    } catch (e: any) { toast.error(e?.message || 'فشل توليد كود جديد') }
  }

  async function onFormSubmit(name: string) {
    if (renameTarget.value) {
      renaming.value = true
      try {
        const res = await teacherApi.updateClass(renameTarget.value.id, { name })
        if (res.success) {
          toast.success('تم تحديث الاسم')
          const renamedId = renameTarget.value?.id
          renameTarget.value = null
          await store.fetchClasses(true)
          eventBus.emit('class:updated', { classId: renamedId })
        } else toast.error(res.message || 'فشل التحديث')
      } catch (e: any) { toast.error(e?.message || 'فشل التحديث') } finally { renaming.value = false }
    } else {
      creating.value = true
      try {
        const res = await teacherApi.createClass(name)
        if (res.success) {
          toast.success('تم إنشاء الفصل')
          showCreate.value = false
          await store.fetchClasses(true)
          eventBus.emit('class:updated', { classId: res.class.id })
        } else toast.error(res.message || 'فشل الإنشاء')
      } catch (e: any) { toast.error(e?.message || 'فشل الإنشاء') } finally { creating.value = false }
    }
  }

  async function confirmDelete() {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
      const res = await teacherApi.deleteClass(deleteTarget.value.id)
      if (res.success) {
        toast.success('تم حذف الفصل')
        eventBus.emit('class:updated', { classId: deleteTarget.value.id })
        deleteTarget.value = null
        deleteConfirm1.value = false
        await store.fetchClasses(true)
      } else {
        toast.error(res.message || 'فشل الحذف')
      }
    } catch (e: any) { toast.error(e?.message || 'فشل الحذف') } finally { deleting.value = false }
  }

  async function load() { await store.fetchClasses(true) }

  function onClassUpdated() { store.fetchClasses(true) }

  onMounted(() => {
    store.fetchClasses()
    eventBus.on('class:updated', onClassUpdated)
  })

  onUnmounted(() => {
    eventBus.off('class:updated', onClassUpdated)
  })

  async function confirmRemove() {
    if (!removeTarget.value || !expandedClass.value) return
    removingStudent.value = removeTarget.value
    try {
      const res = await teacherApi.removeStudentFromClass(expandedClass.value.id, removeTarget.value)
      if (res.success) {
        toast.success('تم إزالة الطالب')
        await store.fetchClasses(true)
        eventBus.emit('class:updated', { classId: expandedClass.value.id })
      } else toast.error(res.message || 'فشل الإزالة')
    } catch (e: any) { toast.error(e?.message || 'فشل الإزالة') } finally {
      removingStudent.value = null; removeTarget.value = null
    }
  }

  return {
    store, teacherName, showCreate, creating, activeClass, expandedClass,
    removingStudent, removeTarget, renameTarget, renaming, deleteTarget, deleting, deleteConfirm1,
    studentProfileOpen, studentProfileClassId, studentProfileStudentId, showBroadcast,
    copyCode, openStudentProfile, selectClass, onActionActive, onAction,
    handleToggleFreeze, handleRegenerateCode, onFormSubmit, confirmDelete, load, confirmRemove,
  }
}
