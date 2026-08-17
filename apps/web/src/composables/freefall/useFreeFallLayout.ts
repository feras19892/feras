import { useExperimentLayout, type ColumnId } from '../experiment/shared/useExperimentLayout'
import { useI18n } from '../useI18n'

export type { ColumnId }
export type PanelId = 'table' | 'equations' | 'stats' | 'scatter' | 'tutor' | 'error' | 'signal' | 'params' | 'guide' | 'report'

export function useFreeFallLayout() {
  const { t } = useI18n()

  return useExperimentLayout({
    storageKey: 'freefall:layout:v2',
    panelIds: ['table', 'equations', 'stats', 'scatter', 'tutor', 'error', 'signal', 'params', 'guide', 'report'],
    defaultVisible: { table: true, equations: false, stats: false, scatter: false, tutor: false, report: false, error: false, signal: true, params: true, guide: false },
    defaultPanelColumn: { table: 'data', equations: 'data', stats: 'data', scatter: 'data', tutor: 'data', report: 'data', error: 'data', signal: 'data', params: 'ctrl', guide: 'ctrl' },
    defaultColumnOrder: { data: ['table', 'signal'], vis: [], ctrl: ['params'] },
    panelTitles: { table: t('experiments.panelTable'), equations: t('experiments.panelEquations'), stats: t('experiments.panelStats'), scatter: t('experiments.panelScatter'), tutor: t('experiments.panelTutor'), report: t('experiments.panelReport'), error: t('experiments.panelError'), signal: t('experiments.panelSignal'), params: t('experiments.panelParams'), guide: t('experiments.panelGuide') },
  })
}
