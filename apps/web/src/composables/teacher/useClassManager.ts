import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../modules/auth/stores/auth'

export interface ClassItem {
  id: string
  name: string
  code: string
}

export function useClassManager() {
  const auth = useAuthStore()
  const classes = ref<ClassItem[]>([])
  const showModal = ref(false)
  const newClassName = ref('')

  function generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  function loadLocalClasses() {
    try {
      const raw = localStorage.getItem('physlab_guest_classes')
      if (raw) classes.value = JSON.parse(raw)
    } catch {
      classes.value = []
    }
  }

  function saveLocalClasses() {
    localStorage.setItem('physlab_guest_classes', JSON.stringify(classes.value))
  }

  function createClass() {
    if (!newClassName.value.trim()) return
    const newClass: ClassItem = {
      id: 'local-' + Date.now(),
      name: newClassName.value.trim(),
      code: generateCode(),
    }
    classes.value.push(newClass)
    saveLocalClasses()
    newClassName.value = ''
    showModal.value = false
  }

  function deleteClass(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الفصل؟')) return
    classes.value = classes.value.filter(c => c.id !== id)
    saveLocalClasses()
  }

  function copyCode(code: string) {
    navigator.clipboard?.writeText(code)
  }

  onMounted(() => {
    if (auth.guestMode) loadLocalClasses()
  })

  return {
    classes,
    showModal,
    newClassName,
    createClass,
    deleteClass,
    copyCode,
  }
}
