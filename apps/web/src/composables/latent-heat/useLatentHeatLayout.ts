import { ref, reactive } from 'vue'
import { useI18n } from '../useI18n'

const STORAGE_KEY = 'latentheat_layout_v1'
const allIds = ['readings', 'chart', 'trials', 'params', 'laws', 'results']

const defaultState = {
  widths: { data: 320, ctrl: 320 },
  visible: ['readings', 'chart', 'trials', 'params', 'laws', 'results'] as string[],
  columnMap: { data: ['readings', 'chart', 'trials'], ctrl: ['params', 'laws', 'results'] } as Record<string, string[]>,
  maximized: Object.fromEntries(allIds.map(id => [id, false])) as Record<string, boolean>,
}

export function useLatentHeatLayout() {
  const { t } = useI18n()
  const PANEL_TITLES: Record<string, string> = {
    readings: t('experiments.panelReadings'), chart: t('experiments.panelChart'), trials: t('experiments.panelTrials'),
    params: t('experiments.panelParams'), laws: t('experiments.panelLaws'), results: t('experiments.panelResults'),
  }
  const widths = reactive<Record<string, number>>({ ...defaultState.widths })
  const visible = ref<string[]>([...defaultState.visible])
  const columnMap = reactive({ ...defaultState.columnMap })
  const maximized = reactive<Record<string, boolean>>({ ...defaultState.maximized })

  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify({ widths, visible: visible.value, columnMap, maximized })) }
  function applyPersistedLayout() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const s = JSON.parse(raw)
      if (s.widths) Object.assign(widths, s.widths)
      if (s.visible) visible.value = s.visible
      if (s.columnMap) Object.assign(columnMap, s.columnMap)
      if (s.maximized) Object.assign(maximized, s.maximized)
    } catch { /* ignore */ }
  }
  function isPanelVisible(id: string) { return visible.value.includes(id) && !maximized[id] }
  function panelTitle(id: string) { return PANEL_TITLES[id] ?? id }
  function togglePanel(id: string) { const i = visible.value.indexOf(id); i >= 0 ? visible.value.splice(i, 1) : visible.value.push(id); persist() }
  function showAllPanels() { visible.value = [...allIds]; allIds.forEach(id => maximized[id] = false); persist() }
  function maximizePanel(id: string) { if (id in maximized) maximized[id] = !maximized[id] }
  return { widths, visible, columnMap, maximized, isPanelVisible, panelTitle, togglePanel, showAllPanels, maximizePanel, applyPersistedLayout, persist }
}
