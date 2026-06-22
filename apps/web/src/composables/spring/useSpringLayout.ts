import { reactive } from 'vue'
import { useI18n } from '../useI18n'

export type ColumnId = 'data' | 'vis' | 'ctrl'
export type PanelId = 'table' | 'signal' | 'params' | 'guide'

const layoutStorageKey = 'spring:layout:v2'

const defaultPanelColumn: Record<PanelId, ColumnId> = {
  table: 'data',
  signal: 'data',
  params: 'ctrl', guide: 'ctrl',
}

const defaultColumnOrder: Record<ColumnId, PanelId[]> = {
  data: ['table', 'signal'],
  vis: [],
  ctrl: ['params', 'guide'],
}

const allPanelIds: PanelId[] = ['table', 'signal', 'params', 'guide']

export function useSpringLayout() {
  const { t } = useI18n()
  // Clear old v1 layout to prevent stale analysis panels from appearing
  try { localStorage.removeItem('spring:layout:v1') } catch { /* ignore */ }

  const panels = reactive<Record<PanelId, boolean>>({
    table: true, signal: true, params: true, guide: true,
  })

  const maximized = reactive<Record<PanelId, boolean>>({
    table: false, signal: false, params: false, guide: false,
  })

  const panelColumn = reactive<Record<PanelId, ColumnId>>({ ...defaultPanelColumn })

  const columnOrder = reactive<Record<ColumnId, PanelId[]>>({
    data: [...defaultColumnOrder.data],
    vis: [...defaultColumnOrder.vis],
    ctrl: [...defaultColumnOrder.ctrl],
  })

  function isPanelVisible(id: string) {
    const pid = id as PanelId
    return panels[pid] && !maximized[pid]
  }

  function togglePanel(key: string) { if (allPanelIds.includes(key as PanelId)) panels[key as PanelId] = !panels[key as PanelId] }

  function showAllPanels() {
    allPanelIds.forEach((k) => { panels[k] = true; maximized[k] = false })
    resetLayout()
  }

  function maximizePanel(key: string) { if (allPanelIds.includes(key as PanelId)) maximized[key as PanelId] = !maximized[key as PanelId] }

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
      if (!placed.has(id)) {
        columnOrder[panelColumn[id]] = [...columnOrder[panelColumn[id]], id]
      }
    }
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) {
      for (const id of columnOrder[col]) panelColumn[id] = col
    }
  }

  function applyPersistedLayout() {
    // clear any stale maximized state
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
          if (Array.isArray(arr)) {
            columnOrder[col] = arr.filter((x: PanelId) => allPanelIds.includes(x)) as PanelId[]
          }
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
    const pid = id as PanelId
    const after = insertAfterId ? (insertAfterId as PanelId) : null
    // remove from all columns
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) {
      columnOrder[col] = columnOrder[col].filter(p => p !== pid)
    }
    // find insert position
    if (after && columnOrder[targetCol].includes(after)) {
      const idx = columnOrder[targetCol].indexOf(after)
      columnOrder[targetCol] = [
        ...columnOrder[targetCol].slice(0, idx + 1),
        pid,
        ...columnOrder[targetCol].slice(idx + 1)
      ]
    } else {
      columnOrder[targetCol] = [pid, ...columnOrder[targetCol]]
    }
    panelColumn[pid] = targetCol
    normalizeLayout()
    persistLayout()
  }

  function panelTitle(id: string) {
    const pid = id as PanelId
    const titles: Record<PanelId, string> = {
      table: t('experiments.panelTable'),
      signal: t('experiments.panelSignal'),
      params: t('experiments.panelParams'),
      guide: t('experiments.panelGuide'),
    }
    return titles[pid] ?? '📊'
  }

  return {
    panels, maximized, panelColumn, columnOrder,
    isPanelVisible, togglePanel, showAllPanels, maximizePanel, movePanel,
    applyPersistedLayout, resetLayout, panelTitle,
  }
}
