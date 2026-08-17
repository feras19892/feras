import { useExperimentLayout, type ColumnId } from '../experiment/shared/useExperimentLayout'
import { useI18n } from '../useI18n'

export type { ColumnId }
export type PanelId = 'table' | 'equations' | 'error' | 'scatter' | 'tutor' | 'signal' | 'fft' | 'phase' | 'params' | 'guide' | 'stats' | 'report'

export function usePendulumLayout() {
  const { t } = useI18n()

  return useExperimentLayout({
    storageKey: 'pendulum:layout:v2',
    panelIds: ['table', 'equations', 'error', 'scatter', 'tutor', 'signal', 'fft', 'phase', 'params', 'guide', 'stats', 'report'],
    defaultVisible: { table: true, equations: false, signal: true, params: true, guide: false, stats: false, fft: false, phase: false, scatter: false, tutor: false, error: false, report: false },
    defaultPanelColumn: { table: 'data', equations: 'data', error: 'data', scatter: 'data', tutor: 'data', report: 'data', signal: 'data', fft: 'vis', phase: 'vis', params: 'ctrl', guide: 'ctrl', stats: 'ctrl' },
    defaultColumnOrder: { data: ['table', 'signal'], vis: [], ctrl: ['params'] },
    panelTitles: { table: t('experiments.panelTable'), equations: t('experiments.panelEquations'), error: t('experiments.panelError'), scatter: t('experiments.panelScatter'), tutor: t('experiments.panelTutor'), report: t('experiments.panelReport'), signal: t('experiments.panelSignal'), fft: t('experiments.panelFft'), phase: t('experiments.panelPhase'), params: t('experiments.panelParams'), guide: t('experiments.panelGuide'), stats: t('experiments.panelStats') },
  })
}
