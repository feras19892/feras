import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../modules/auth/stores/auth'
import { useCommandPalette } from './useCommandPalette'

export interface ShortcutDef {
  key: string
  ctrl?: boolean
  shift?: boolean
  label: string
  action: () => void
}

export function useKeyboardShortcuts() {
  const router = useRouter()
  const auth = useAuthStore()
  const palette = useCommandPalette()

  const shortcuts: ShortcutDef[] = [
    { key: 'k', ctrl: true, label: 'بحث عام (Ctrl+K)', action: () => palette.toggle() },
    { key: 'h', ctrl: true, label: 'الرئيسية (Ctrl+H)', action: () => router.push('/home') },
    { key: 'g', ctrl: true, label: 'لوحتي (Ctrl+G)', action: () => {
      const role = auth.role
      if (role === 'student') router.push('/student')
      else if (role === 'teacher') router.push('/teacher')
      else if (role === 'admin') router.push('/admin')
      else if (role === 'school') router.push('/school')
    }},
    { key: 'p', ctrl: true, label: 'الفيزياء (Ctrl+P)', action: () => router.push('/physics') },
    { key: 'c', ctrl: true, shift: true, label: 'الكيمياء (Ctrl+Shift+C)', action: () => router.push('/chemistry') },
    { key: 'b', ctrl: true, label: 'الأحياء (Ctrl+B)', action: () => router.push('/biology') },
    { key: 'a', ctrl: true, label: 'أداة التحليل (Ctrl+A)', action: () => router.push('/analysis') },
  ]

  function matchShortcut(e: KeyboardEvent, def: ShortcutDef): boolean {
    if (!!def.ctrl !== (e.ctrlKey || e.metaKey)) return false
    if (!!def.shift !== e.shiftKey) return false
    return e.key.toLowerCase() === def.key.toLowerCase()
  }

  function onKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      if (!(e.ctrlKey || e.metaKey)) return
    }
    for (const s of shortcuts) {
      if (matchShortcut(e, s)) {
        e.preventDefault()
        s.action()
        return
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))

  return { shortcuts }
}
