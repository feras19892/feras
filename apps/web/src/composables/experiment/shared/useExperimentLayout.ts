import { reactive, computed, watchEffect } from 'vue'

export type ColumnId = 'data' | 'vis' | 'ctrl'
export const COLUMN_IDS: ColumnId[] = ['data', 'vis', 'ctrl']

export interface ExperimentLayoutConfig {
  storageKey: string
  panelIds: string[]
  defaultVisible?: Record<string, boolean>
  defaultPanelColumn: Record<string, ColumnId>
  defaultColumnOrder: Record<ColumnId, string[]>
  defaultWidths?: Record<string, number>
  panelTitles: Record<string, string>
  clearOldKey?: string
}

export function useExperimentLayout(config: ExperimentLayoutConfig) {
  if (config.clearOldKey) {
    try { localStorage.removeItem(config.clearOldKey) } catch { /* ignore */ }
  }

  const allPanelIds = config.panelIds

  const panels = reactive<Record<string, boolean>>(
    Object.fromEntries(allPanelIds.map(id => [id, config.defaultVisible?.[id] ?? true]))
  )

  const maximized = reactive<Record<string, boolean>>(
    allPanelIds.reduce((acc, id) => ({ ...acc, [id]: false }), {})
  )

  const panelColumn = reactive<Record<string, ColumnId>>({ ...config.defaultPanelColumn })

  const columnOrder = reactive<Record<ColumnId, string[]>>({
    data: [...(config.defaultColumnOrder.data || [])],
    vis: [...(config.defaultColumnOrder.vis || [])],
    ctrl: [...(config.defaultColumnOrder.ctrl || [])],
  })

  const widths = reactive<Record<string, number>>(
    { data: 320, ctrl: 320, ...config.defaultWidths }
  )

  const visible = computed(() => allPanelIds.filter(id => panels[id] && !maximized[id]))

  const columnMap = reactive<Record<string, string[]>>({ data: [], vis: [], ctrl: [] })
  watchEffect(() => {
    for (const col of COLUMN_IDS) {
      columnMap[col] = columnOrder[col].filter(id => panels[id] && !maximized[id])
    }
  })

  function isPanelVisible(id: string): boolean {
    return panels[id] && !maximized[id]
  }

  function togglePanel(id: string): void {
    if (allPanelIds.includes(id)) panels[id] = !panels[id]
    persist()
  }

  function showAllPanels(): void {
    allPanelIds.forEach(k => { panels[k] = true; maximized[k] = false })
    resetLayout()
  }

  function showPanels(ids: string[]): void {
    for (const id of ids) {
      if (allPanelIds.includes(id)) panels[id] = true
    }
    persist()
  }

  function maximizePanel(id: string): void {
    if (allPanelIds.includes(id)) maximized[id] = !maximized[id]
  }

  function persist(): void {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify({
        panelColumn, columnOrder, widths,
        visible: visible.value,
        maximized,
      }))
    } catch { /* ignore */ }
  }

  function normalizeLayout(): void {
    for (const id of allPanelIds) {
      const col = panelColumn[id]
      if (!COLUMN_IDS.includes(col)) panelColumn[id] = 'data'
    }
    for (const col of COLUMN_IDS) {
      const seen = new Set<string>()
      columnOrder[col] = (columnOrder[col] || []).filter(id =>
        allPanelIds.includes(id) && !seen.has(id) && (seen.add(id), true)
      )
    }
    const placed = new Set<string>([...columnOrder.data, ...columnOrder.vis, ...columnOrder.ctrl])
    for (const id of allPanelIds) {
      if (!placed.has(id)) columnOrder[panelColumn[id]] = [...columnOrder[panelColumn[id]], id]
    }
    for (const col of COLUMN_IDS) {
      for (const id of columnOrder[col]) panelColumn[id] = col
    }
  }

  function applyPersistedLayout(): void {
    allPanelIds.forEach(k => { maximized[k] = false })
    try {
      const raw = localStorage.getItem(config.storageKey)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed.panelColumn) {
        for (const k of allPanelIds) {
          const v = parsed.panelColumn[k]
          if (COLUMN_IDS.includes(v)) panelColumn[k] = v
        }
      }
      if (parsed.columnOrder) {
        for (const col of COLUMN_IDS) {
          const arr = parsed.columnOrder[col]
          if (Array.isArray(arr)) columnOrder[col] = arr.filter((x: string) => allPanelIds.includes(x))
        }
      }
      if (parsed.widths) Object.assign(widths, parsed.widths)
      if (parsed.maximized) {
        for (const k of allPanelIds) {
          if (typeof parsed.maximized[k] === 'boolean') maximized[k] = parsed.maximized[k]
        }
      }
      if (parsed.visible) {
        const visSet = new Set(parsed.visible)
        for (const k of allPanelIds) panels[k] = visSet.has(k)
      }
      normalizeLayout()
    } catch { /* ignore */ }
  }

  function resetLayout(): void {
    allPanelIds.forEach(id => { panelColumn[id] = config.defaultPanelColumn[id] })
    for (const col of COLUMN_IDS) columnOrder[col] = [...(config.defaultColumnOrder[col] || [])]
    normalizeLayout()
    persist()
  }

  function movePanel(id: string, targetCol: ColumnId, insertAfterId?: string | null): void {
    for (const col of COLUMN_IDS) columnOrder[col] = columnOrder[col].filter(p => p !== id)
    if (insertAfterId && columnOrder[targetCol].includes(insertAfterId)) {
      const idx = columnOrder[targetCol].indexOf(insertAfterId)
      columnOrder[targetCol] = [
        ...columnOrder[targetCol].slice(0, idx + 1),
        id,
        ...columnOrder[targetCol].slice(idx + 1),
      ]
    } else {
      columnOrder[targetCol] = [id, ...columnOrder[targetCol]]
    }
    panelColumn[id] = targetCol
    normalizeLayout()
    persist()
  }

  function panelTitle(id: string): string {
    return config.panelTitles[id] ?? id
  }

  return {
    panels, maximized, panelColumn, columnOrder, widths,
    visible, columnMap,
    isPanelVisible, togglePanel, showAllPanels, showPanels, maximizePanel,
    movePanel, applyPersistedLayout, resetLayout, panelTitle,
    persist, normalizeLayout,
  }
}
