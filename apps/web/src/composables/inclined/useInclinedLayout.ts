import { useExperimentLayout, type ColumnId } from '../experiment/shared/useExperimentLayout'
import { useI18n } from '../useI18n'

export type { ColumnId }
export type PanelId = 'table' | 'equations' | 'stats' | 'scatter' | 'signal' | 'params' | 'guide' | 'error'

export function useInclinedLayout() {
  const { t } = useI18n()

  return useExperimentLayout({
    storageKey: 'inclined:layout:v2',
    panelIds: ['table', 'equations', 'stats', 'scatter', 'signal', 'params', 'guide', 'error'],
    defaultVisible: { table: true, equations: false, stats: false, scatter: false, error: false, signal: true, params: true, guide: false },
    defaultPanelColumn: { table: 'data', equations: 'data', stats: 'data', scatter: 'data', error: 'data', signal: 'vis', params: 'ctrl', guide: 'ctrl' },
    defaultColumnOrder: { data: ['table'], vis: [], ctrl: ['params'] },
    panelTitles: { table: t('experiments.panelTable'), equations: t('experiments.panelEquations'), stats: t('experiments.panelStats'), scatter: t('experiments.panelChart'), signal: t('experiments.panelSignal'), error: t('experiments.potentialErrorSources'), params: t('experiments.panelParams'), guide: t('experiments.guidePanel') },
  })
}
