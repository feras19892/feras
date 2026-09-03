import { ref, watch, onMounted, onUnmounted } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'dashboard-theme'
const mode = ref<ThemeMode>('light')
const resolved = ref<'light' | 'dark'>('light')
let mediaQuery: MediaQueryList | null = null
let onMediaChange: (() => void) | null = null

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark')
  } else {
    root.removeAttribute('data-theme')
  }
  resolved.value = theme
}

function resolveTheme() {
  if (mode.value === 'auto') {
    return mediaQuery?.matches ? 'dark' : 'light'
  }
  return mode.value
}

function syncResolved() {
  applyTheme(resolveTheme())
}

export function useTheme() {
  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      mode.value = saved
    }
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    onMediaChange = () => { if (mode.value === 'auto') syncResolved() }
    mediaQuery.addEventListener('change', onMediaChange)
    syncResolved()
  })

  onUnmounted(() => {
    if (mediaQuery && onMediaChange) mediaQuery.removeEventListener('change', onMediaChange)
  })

  function setTheme(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem(STORAGE_KEY, newMode)
    syncResolved()
  }

  function toggleTheme() {
    const next: ThemeMode = resolved.value === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  watch(mode, syncResolved)

  return {
    mode,
    resolved,
    setTheme,
    toggleTheme,
  }
}
