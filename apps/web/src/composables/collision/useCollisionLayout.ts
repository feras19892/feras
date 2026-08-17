import { useExperimentLayout, type ColumnId } from '../experiment/shared/useExperimentLayout'
import { useI18n } from '../useI18n'

export type { ColumnId }
export type PanelId = 'params' | 'data' | 'signal' | 'scatter' | 'stats' | 'equations' | 'report'

export function useCollisionLayout() {
  const { t } = useI18n()

  return useExperimentLayout({
    storageKey: 'collision:layout:v2',
    panelIds: ['params', 'data', 'signal', 'scatter', 'stats', 'equations', 'report'],
    defaultVisible: { params: true, data: true, signal: true, scatter: false, stats: false, equations: false, report: false },
    defaultPanelColumn: { params: 'ctrl', data: 'data', signal: 'data', scatter: 'data', stats: 'data', equations: 'data', report: 'data' },
    defaultColumnOrder: { data: ['data', 'signal', 'scatter'], vis: [], ctrl: ['params'] },
    panelTitles: { params: t('experiments.panelParams'), data: t('experiments.panelData'), signal: t('experiments.panelSignal'), scatter: t('experiments.panelScatter'), stats: t('experiments.panelStats'), equations: t('experiments.panelEquations'), report: t('experiments.panelReport') },
  })
}
