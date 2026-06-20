import { reactive, ref } from 'vue'

const STORAGE_KEY = 'lever:layout:v4'

const DEFAULT_ORDER = {
  data: ['balls', 'table'],
  vis: [],
}

const PANEL_TITLES: Record<string, string> = {
  balls: '🔴 الكرات',
  table: '📋 جدول القراءات',
  signal: '📈 توزيع العزوم',
  stats: '📊 إحصائيات',
  equation: '🧮 المعادلة',
  report: '📝 التقرير',
}

export function useLeverLayout() {
  const visible = ref<Set<string>>(new Set(['balls', 'table']))
  const columnOrder = reactive<Record<string, string[]>>(JSON.parse(JSON.stringify(DEFAULT_ORDER)))
  const maximized = reactive<Record<string, boolean>>({})

  function isPanelVisible(id: string) { return visible.value.has(id) }
  function togglePanel(id: string) {
    if (visible.value.has(id)) visible.value.delete(id)
    else visible.value.add(id)
    persist()
  }
  function showAllPanels() {
    visible.value = new Set(Object.keys(PANEL_TITLES))
    persist()
  }
  function showPanels(ids: string[]) {
    for (const id of ids) visible.value.add(id)
    persist()
  }
  function panelTitle(id: string) { return PANEL_TITLES[id] || id }

  function maximizePanel(id: string) {
    maximized[id] = !maximized[id]
  }

  function movePanel(id: string, col: string, afterId?: string | null) {
    for (const c of Object.keys(columnOrder)) {
      columnOrder[c] = columnOrder[c].filter((pid) => pid !== id)
    }
    if (!columnOrder[col]) columnOrder[col] = []
    if (afterId) {
      const idx = columnOrder[col].indexOf(afterId)
      if (idx >= 0) columnOrder[col].splice(idx + 1, 0, id)
      else columnOrder[col].push(id)
    } else {
      columnOrder[col].push(id)
    }
    persist()
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      visible: Array.from(visible.value),
      columnOrder,
    }))
  }

  function applyPersistedLayout() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.visible) visible.value = new Set(parsed.visible)
        if (parsed.columnOrder) Object.assign(columnOrder, parsed.columnOrder)
      }
    } catch { /* ignore */ }
  }

  return {
    visible,
    columnOrder,
    maximized,
    isPanelVisible,
    togglePanel,
    showAllPanels,
    showPanels,
    panelTitle,
    maximizePanel,
    movePanel,
    applyPersistedLayout,
  }
}
