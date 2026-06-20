import { reactive } from 'vue'

export type ColumnId = 'data' | 'vis' | 'ctrl'
export type PanelId = 'table' | 'equations' | 'scatter' | 'tutor' | 'signal' | 'vxSignal' | 'vySignal' | 'params' | 'guide' | 'stats' | 'report'

const layoutStorageKey = 'projectile:layout:v2'

const defaultPanelColumn: Record<PanelId, ColumnId> = {
  table: 'data', equations: 'data', scatter: 'data', tutor: 'data', report: 'data',
  signal: 'vis', vxSignal: 'vis', vySignal: 'vis',
  params: 'ctrl', guide: 'ctrl', stats: 'ctrl',
}

const defaultColumnOrder: Record<ColumnId, PanelId[]> = {
  data: ['table'],
  vis: ['signal', 'vxSignal', 'vySignal'],
  ctrl: ['params', 'guide'],
}

const allPanelIds: PanelId[] = [
  'table', 'equations', 'scatter', 'tutor', 'report',
  'signal', 'vxSignal', 'vySignal', 'params', 'guide', 'stats',
]

export function useProjectileLayout() {
  try { localStorage.removeItem('projectile:layout:v1') } catch { /* ignore */ }

  const panels = reactive<Record<PanelId, boolean>>({
    table: true, equations: false, signal: true, params: true, guide: true, stats: false,
    vxSignal: true, vySignal: true, scatter: false, tutor: false, report: false,
  })

  const maximized = reactive<Record<PanelId, boolean>>({
    table: false, equations: false, signal: false, params: false, guide: false, stats: false,
    vxSignal: false, vySignal: false, scatter: false, tutor: false, report: false,
  })

  const panelColumn = reactive<Record<PanelId, ColumnId>>({ ...defaultPanelColumn })

  const columnOrder = reactive<Record<ColumnId, PanelId[]>>({
    data: [...defaultColumnOrder.data], vis: [...defaultColumnOrder.vis], ctrl: [...defaultColumnOrder.ctrl],
  })

  function isPanelVisible(id: PanelId) { return panels[id] && !maximized[id] }
  function togglePanel(key: string) { if (allPanelIds.includes(key as PanelId)) panels[key as PanelId] = !panels[key as PanelId] }
  function showAllPanels() { allPanelIds.forEach((k) => { panels[k] = true; maximized[k] = false }); resetLayout() }
  function maximizePanel(key: string) { if (allPanelIds.includes(key as PanelId)) maximized[key as PanelId] = !maximized[key as PanelId] }

  function persistLayout() { try { localStorage.setItem(layoutStorageKey, JSON.stringify({ panelColumn, columnOrder })) } catch { /* ignore */ } }

  function normalizeLayout() {
    for (const id of allPanelIds) { const col = panelColumn[id]; if (col !== 'data' && col !== 'vis' && col !== 'ctrl') panelColumn[id] = 'data' }
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) {
      const seen = new Set<PanelId>()
      columnOrder[col] = (columnOrder[col] || []).filter((id) => allPanelIds.includes(id) && !seen.has(id) && (seen.add(id), true))
    }
    const placed = new Set<PanelId>([...columnOrder.data, ...columnOrder.vis, ...columnOrder.ctrl])
    for (const id of allPanelIds) { if (!placed.has(id)) columnOrder[panelColumn[id]] = [...columnOrder[panelColumn[id]], id] }
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) { for (const id of columnOrder[col]) panelColumn[id] = col }
  }

  function applyPersistedLayout() {
    allPanelIds.forEach((k) => { maximized[k] = false })
    try {
      const raw = localStorage.getItem(layoutStorageKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as { panelColumn?: Record<string, ColumnId>, columnOrder?: Record<string, PanelId[]> }
      if (parsed.panelColumn) { for (const k of allPanelIds) { const v = parsed.panelColumn[k]; if (v === 'data' || v === 'vis' || v === 'ctrl') panelColumn[k] = v } }
      if (parsed.columnOrder) { for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) { const arr = parsed.columnOrder[col]; if (Array.isArray(arr)) columnOrder[col] = arr.filter((x: any) => allPanelIds.includes(x)) as PanelId[] } }
      normalizeLayout()
    } catch { /* ignore */ }
  }

  function resetLayout() {
    allPanelIds.forEach((id) => { panelColumn[id] = defaultPanelColumn[id] })
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) { columnOrder[col] = [...defaultColumnOrder[col]] }
    normalizeLayout(); persistLayout()
  }

  function movePanel(id: PanelId, targetCol: ColumnId, insertAfterId?: PanelId | null) {
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) { columnOrder[col] = columnOrder[col].filter(pid => pid !== id) }
    if (insertAfterId && columnOrder[targetCol].includes(insertAfterId)) {
      const idx = columnOrder[targetCol].indexOf(insertAfterId)
      columnOrder[targetCol] = [...columnOrder[targetCol].slice(0, idx + 1), id, ...columnOrder[targetCol].slice(idx + 1)]
    } else { columnOrder[targetCol] = [id, ...columnOrder[targetCol]] }
    panelColumn[id] = targetCol; normalizeLayout(); persistLayout()
  }

  function panelTitle(id: PanelId) {
    const titles: Record<PanelId, string> = {
      table: '📋 قراءات', equations: '⚗️ حسابات', scatter: '📈 Scatter',
      tutor: '⚖️ تحليل مباشر', report: '📋 تقرير',
      signal: '📈 مسار y(x)', vxSignal: '📈 vₓ(t)', vySignal: '📈 vᵧ(t)',
      params: '⚙️ معاملات', guide: '📋 دليل', stats: '📊 إحصائيات',
    }
    return titles[id] ?? '📊 إحصائيات'
  }

  return {
    panels, maximized, panelColumn, columnOrder,
    isPanelVisible, togglePanel, showAllPanels, maximizePanel, movePanel,
    applyPersistedLayout, resetLayout, panelTitle,
  }
}
