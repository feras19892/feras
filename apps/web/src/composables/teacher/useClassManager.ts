import { ref, onMounted } from 'vue'
import { useI18n } from '../useI18n'
import {
  createClass as apiCreateClass,
  getMyClasses,
  getClassDetails,
  deleteClass as apiDeleteClass,
} from '../../services/class.service'
import type { ClassItem, ClassStudent } from '../../services/class.service'

export { type ClassItem, type ClassStudent }

export function useClassManager() {
  const { t } = useI18n()
  const classes = ref<ClassItem[]>([])
  const expandedId = ref<string | null>(null)
  const classStudents = ref<ClassStudent[]>([])
  const loading = ref(false)
  const showModal = ref(false)
  const newClassName = ref('')

  async function loadClasses() {
    loading.value = true
    try {
      const res = await getMyClasses()
      if (res.success) classes.value = res.classes
    } catch (err) {
      console.error('load classes failed:', err)
    } finally {
      loading.value = false
    }
  }

  async function createClass() {
    if (!newClassName.value.trim()) return
    try {
      const res = await apiCreateClass(newClassName.value.trim())
      if (res.success) {
        classes.value.unshift(res.class)
        newClassName.value = ''
        showModal.value = false
      }
    } catch (err) {
      console.error('create class failed:', err)
    }
  }

  async function deleteClass(id: string) {
    if (!confirm(t('admin.confirmDeleteClassShort'))) return
    try {
      const res = await apiDeleteClass(id)
      if (res.success) classes.value = classes.value.filter(c => c.id !== id)
    } catch (err) {
      console.error('delete class failed:', err)
    }
  }

  async function loadClassDetails(id: string) {
    if (expandedId.value === id) { expandedId.value = null; return }
    try {
      const res = await getClassDetails(id)
      if (res.success) {
        classStudents.value = res.students
        expandedId.value = id
      }
    } catch (err) {
      console.error('load class details failed:', err)
    }
  }

  function copyCode(code: string) {
    navigator.clipboard?.writeText(code)
  }

  onMounted(() => {
    loadClasses()
  })

  return {
    classes,
    expandedId,
    classStudents,
    showModal,
    newClassName,
    loading,
    createClass,
    deleteClass,
    copyCode,
    loadClassDetails,
  }
}
