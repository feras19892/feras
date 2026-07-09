import { reactive } from 'vue'
import { useI18n } from '../useI18n'

export type ColumnId = 'data' | 'vis' | 'ctrl'
export type PanelId = 'readings' | 'chart' | 'trials' | 'params' | 'laws' | 'results'

const layoutStorageKey = 'mirror:layout:v1'

const defaultPanelColumn: Record<PanelId, ColumnId> = {
  readings: 'data',
  chart: 'data',
  trials: 'data',
  params: 'ctrl',
  laws: 'ctrl',
  results: 'ctrl',
}

const defaultColumnOrder: Record<ColumnId, PanelId[]> = {
  data: ['readings', 'chart', 'trials'],
  vis: [],
  ctrl: ['params'],
}

const allPanelIds: PanelId[] = ['readings', 'chart', 'trials', 'params', 'laws', 'results']

export function useMirrorLayout() {
  const { t } = useI18n()
  const panels = reactive<Record<PanelId, boolean>>({
    readings: true, chart: true, trials: true,
    params: true, laws: false, results: false,
  })

  const maximized = reactive<Record<PanelId, boolean>>({
    readings: false, chart: false, trials: false,
    params: false, laws: false, results: false,
  })

  const panelColumn = reactive<Record<PanelId, ColumnId>>({ ...defaultPanelColumn })

  const columnOrder = reactive<Record<ColumnId, PanelId[]>>({
    data: [...defaultColumnOrder.data],
    vis: [...defaultColumnOrder.vis],
    ctrl: [...defaultColumnOrder.ctrl],
  })

  const panelIdSet = new Set<PanelId>(allPanelIds)
  function isPanelId(key: string): key is PanelId {
    return panelIdSet.has(key as PanelId)
  }

  function isPanelVisible(id: string) {
    if (!isPanelId(id)) return false
    return panels[id] && !maximized[id]
  }

  function togglePanel(key: string) {
    if (isPanelId(key)) panels[key] = !panels[key]
  }

  function showAllPanels() {
    allPanelIds.forEach((k) => { panels[k] = true; maximized[k] = false })
    resetLayout()
  }

  function maximizePanel(key: string) {
    if (isPanelId(key)) maximized[key] = !maximized[key]
  }

  function persistLayout() {
    try { localStorage.setItem(layoutStorageKey, JSON.stringify({ panelColumn, columnOrder })) } catch { /* ignore */ }
  }

  function normalizeLayout() {
    for (const id of allPanelIds) {
      const col = panelColumn[id]
      if (col !== 'data' && col !== 'vis' && col !== 'ctrl') panelColumn[id] = 'data'
    }
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) {
      const seen = new Set<PanelId>()
      columnOrder[col] = (columnOrder[col] || []).filter((id) => allPanelIds.includes(id) && !seen.has(id) && (seen.add(id), true))
    }
    const placed = new Set<PanelId>([...columnOrder.data, ...columnOrder.vis, ...columnOrder.ctrl])
    for (const id of allPanelIds) {
      if (!placed.has(id)) columnOrder[panelColumn[id]] = [...columnOrder[panelColumn[id]], id]
    }
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) {
      for (const id of columnOrder[col]) panelColumn[id] = col
    }
  }

  function applyPersistedLayout() {
    allPanelIds.forEach((k) => { maximized[k] = false })
    try {
      const raw = localStorage.getItem(layoutStorageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as { panelColumn?: Record<string, ColumnId>, columnOrder?: Record<string, PanelId[]> }
      if (parsed.panelColumn) {
        for (const k of allPanelIds) {
          const v = parsed.panelColumn[k]
          if (v === 'data' || v === 'vis' || v === 'ctrl') panelColumn[k] = v
        }
      }
      if (parsed.columnOrder) {
        for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) {
          const arr = parsed.columnOrder[col]
          if (Array.isArray(arr)) columnOrder[col] = arr.filter((x: PanelId) => allPanelIds.includes(x)) as PanelId[]
        }
      }
      normalizeLayout()
    } catch { /* ignore */ }
  }

  function resetLayout() {
    allPanelIds.forEach((id) => { panelColumn[id] = defaultPanelColumn[id] })
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) {
      columnOrder[col] = [...defaultColumnOrder[col]]
    }
    normalizeLayout()
    persistLayout()
  }

  function movePanel(id: string, targetCol: ColumnId, insertAfterId?: string | null) {
    if (!isPanelId(id)) return
    const pid = id
    const after = insertAfterId && isPanelId(insertAfterId) ? insertAfterId : null
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) {
      columnOrder[col] = columnOrder[col].filter(p => p !== pid)
    }
    if (after && columnOrder[targetCol].includes(after)) {
      const idx = columnOrder[targetCol].indexOf(after)
      columnOrder[targetCol] = [...columnOrder[targetCol].slice(0, idx + 1), pid, ...columnOrder[targetCol].slice(idx + 1)]
    } else {
      columnOrder[targetCol] = [pid, ...columnOrder[targetCol]]
    }
    panelColumn[pid] = targetCol
    normalizeLayout()
    persistLayout()
  }

  function panelTitle(id: string) {
    if (!isPanelId(id)) return '📊'
    const titles: Record<PanelId, string> = {
      readings: t('experiments.panelReadings'),
      chart: t('experiments.panelChart'),
      trials: t('experiments.panelTrials'),
      params: t('experiments.panelParams'),
      laws: t('experiments.panelLaws'),
      results: t('experiments.panelResults'),
    }
    return titles[id]
  }

  return {
    panels, maximized, panelColumn, columnOrder,
    isPanelVisible, togglePanel, showAllPanels, maximizePanel, movePanel,
    applyPersistedLayout, resetLayout, panelTitle,
  }
}
