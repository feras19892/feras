import { reactive } from 'vue'
import { useI18n } from '../useI18n'

export type ColumnId = 'data' | 'vis' | 'ctrl'
export type PanelId = 'table' | 'signal' | 'equations' | 'guide' | 'report'

const layoutStorageKey = 'lever:layout:v1'

const defaultPanelColumn: Record<PanelId, ColumnId> = {
  table: 'data', signal: 'data', equations: 'ctrl', guide: 'ctrl', report: 'ctrl',
}

const defaultColumnOrder: Record<ColumnId, PanelId[]> = {
  data: ['table', 'signal'], vis: [], ctrl: ['equations', 'guide', 'report'],
}

const allPanelIds: PanelId[] = ['table', 'signal', 'equations', 'guide', 'report']

export function useLeverLayout() {
  const { t } = useI18n()
  const panels = reactive<Record<PanelId, boolean>>({ table: true, signal: true, equations: true, guide: true, report: true })
  const maximized = reactive<Record<PanelId, boolean>>({ table: false, signal: false, equations: false, guide: false, report: false })
  const panelColumn = reactive<Record<PanelId, ColumnId>>({ ...defaultPanelColumn })
  const columnOrder = reactive<Record<ColumnId, PanelId[]>>({ data: [...defaultColumnOrder.data], vis: [...defaultColumnOrder.vis], ctrl: [...defaultColumnOrder.ctrl] })

  function isPanelVisible(id: string) { const pid = id as PanelId; return panels[pid] && !maximized[pid] }
  function togglePanel(key: string) { if (allPanelIds.includes(key as PanelId)) panels[key as PanelId] = !panels[key as PanelId] }
  function showAllPanels() { allPanelIds.forEach(k => { panels[k] = true; maximized[k] = false }); resetLayout() }
  function maximizePanel(key: string) { if (allPanelIds.includes(key as PanelId)) maximized[key as PanelId] = !maximized[key as PanelId] }

  function persistLayout() { try { localStorage.setItem(layoutStorageKey, JSON.stringify({ panelColumn, columnOrder })) } catch {} }

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
    allPanelIds.forEach(k => { maximized[k] = false })
    try {
      const raw = localStorage.getItem(layoutStorageKey)
      if (!raw) return
      const p = JSON.parse(raw) as { panelColumn?: Record<string, ColumnId>, columnOrder?: Record<string, PanelId[]> }
      if (p.panelColumn) { for (const k of allPanelIds) { const v = p.panelColumn[k]; if (v === 'data' || v === 'vis' || v === 'ctrl') panelColumn[k] = v } }
      if (p.columnOrder) { for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) { const arr = p.columnOrder[col]; if (Array.isArray(arr)) columnOrder[col] = arr.filter((x: PanelId) => allPanelIds.includes(x)) as PanelId[] } }
      normalizeLayout()
    } catch {}
  }

  function resetLayout() {
    allPanelIds.forEach(id => { panelColumn[id] = defaultPanelColumn[id] })
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) columnOrder[col] = [...defaultColumnOrder[col]]
    normalizeLayout(); persistLayout()
  }

  function movePanel(id: string, targetCol: ColumnId, insertAfterId?: string | null) {
    const pid = id as PanelId; const after = insertAfterId ? (insertAfterId as PanelId) : null
    for (const col of ['data', 'vis', 'ctrl'] as ColumnId[]) columnOrder[col] = columnOrder[col].filter(p => p !== pid)
    if (after && columnOrder[targetCol].includes(after)) { const idx = columnOrder[targetCol].indexOf(after); columnOrder[targetCol] = [...columnOrder[targetCol].slice(0, idx + 1), pid, ...columnOrder[targetCol].slice(idx + 1)] }
    else { columnOrder[targetCol] = [pid, ...columnOrder[targetCol]] }
    panelColumn[pid] = targetCol; normalizeLayout(); persistLayout()
  }

  function panelTitle(id: string) {
    const titles: Record<PanelId, string> = {
      table: t('experiments.panelTable'), signal: t('experiments.panelSignal'),
      equations: t('experiments.equation'), guide: t('experiments.panelGuide'), report: t('experiments.reportLabel'),
    }
    return titles[id as PanelId] ?? ''
  }

  return { panels, maximized, panelColumn, columnOrder, isPanelVisible, togglePanel, showAllPanels, maximizePanel, movePanel, applyPersistedLayout, resetLayout, panelTitle }
}
