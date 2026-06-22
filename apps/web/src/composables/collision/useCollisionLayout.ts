import { reactive, ref } from 'vue'
import { useI18n } from '../useI18n'

const STORAGE_KEY = 'collision:layout:v2'

export type PanelId = 'params' | 'data' | 'signal' | 'stats' | 'equations' | 'report'
export type ColumnId = 'data' | 'vis' | 'ctrl'

const DEFAULT_ORDER: Record<ColumnId, PanelId[]> = {
  data: ['data', 'signal'],
  vis: [],
  ctrl: ['params'],
}

export function useCollisionLayout() {
  const { t } = useI18n()

  const PANEL_TITLES: Record<PanelId, string> = {
    params: t('experiments.panelParams'),
    data: t('experiments.panelData'),
    signal: t('experiments.panelSignal'),
    stats: t('experiments.panelStats'),
    equations: t('experiments.panelEquations'),
    report: t('experiments.panelReport'),
  }
  const visible = ref<Set<PanelId>>(new Set(['params', 'data', 'signal']))
  const columnOrder = reactive<Record<ColumnId, PanelId[]>>(JSON.parse(JSON.stringify(DEFAULT_ORDER)))
  const maximized = reactive<Partial<Record<PanelId, boolean>>>({})

  function isPanelVisible(id: string) { return visible.value.has(id as PanelId) }
  function togglePanel(id: string) {
    const pid = id as PanelId
    if (visible.value.has(pid)) visible.value.delete(pid)
    else visible.value.add(pid)
    persist()
  }
  function showAllPanels() {
    visible.value = new Set(Object.keys(PANEL_TITLES) as PanelId[])
    persist()
  }
  function showPanels(ids: PanelId[]) {
    for (const id of ids) visible.value.add(id)
    persist()
  }
  function panelTitle(id: string) { return PANEL_TITLES[id as PanelId] ?? id }

  function maximizePanel(id: string) {
    const pid = id as PanelId
    maximized[pid] = !maximized[pid]
  }

  function movePanel(id: string, col: ColumnId, afterId?: string | null) {
    const pid = id as PanelId
    const after = afterId ? (afterId as PanelId) : null
    for (const c of Object.keys(columnOrder) as ColumnId[]) {
      columnOrder[c] = columnOrder[c].filter((p) => p !== pid)
    }
    if (!columnOrder[col]) columnOrder[col] = []
    if (after) {
      const idx = columnOrder[col].indexOf(after)
      if (idx >= 0) columnOrder[col].splice(idx + 1, 0, pid)
      else columnOrder[col].push(pid)
    } else {
      columnOrder[col].push(pid)
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
