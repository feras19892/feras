import { ref, watch } from 'vue'

export type Density = 'comfortable' | 'compact'
export type FontSize = 'small' | 'medium' | 'large'

const STORAGE_KEY = 'dashboard-preferences'

interface SavedPrefs {
  density: Density
  fontSize: FontSize
  lastTabs: Record<string, string>
}

const defaults: SavedPrefs = {
  density: 'comfortable',
  fontSize: 'medium',
  lastTabs: {},
}

const density = ref<Density>(defaults.density)
const fontSize = ref<FontSize>(defaults.fontSize)
const lastTabs = ref<Record<string, string>>(defaults.lastTabs)

let loaded = false

function load() {
  if (loaded) return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedPrefs>
      if (parsed.density) density.value = parsed.density
      if (parsed.fontSize) fontSize.value = parsed.fontSize
      if (parsed.lastTabs) lastTabs.value = parsed.lastTabs
    }
  } catch { /* silent */ }
}

function save() {
  const data: SavedPrefs = {
    density: density.value,
    fontSize: fontSize.value,
    lastTabs: lastTabs.value,
  }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* silent */ }
}

function applyDensity(d: Density) {
  const root = document.documentElement
  root.setAttribute('data-density', d)
}

function applyFontSize(s: FontSize) {
  const root = document.documentElement
  root.setAttribute('data-font-size', s)
}

export function usePreferences() {
  load()

  watch(density, (v) => { applyDensity(v); save() }, { immediate: true })
  watch(fontSize, (v) => { applyFontSize(v); save() }, { immediate: true })

  function setDensity(d: Density) { density.value = d }
  function setFontSize(s: FontSize) { fontSize.value = s }
  function setLastTab(role: string, tabId: string) {
    lastTabs.value = { ...lastTabs.value, [role]: tabId }
    save()
  }
  function getLastTab(role: string): string | null {
    return lastTabs.value[role] ?? null
  }

  return {
    density,
    fontSize,
    setDensity,
    setFontSize,
    setLastTab,
    getLastTab,
  }
}
