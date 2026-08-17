import { useExperimentLayout, type ColumnId } from '../experiment/shared/useExperimentLayout'
import { useI18n } from '../useI18n'

export type { ColumnId }

export function useProjectileLayout() {
  const { t } = useI18n()

  return useExperimentLayout({
    storageKey: 'projectile:layout:v3',
    panelIds: ['table', 'equations', 'scatter', 'tutor', 'signal', 'vxSignal', 'vySignal', 'params', 'guide', 'stats', 'report'],
    defaultVisible: { table: true, equations: false, signal: true, params: true, guide: false, stats: false, vxSignal: true, vySignal: true, scatter: false, tutor: false, report: false },
    defaultPanelColumn: { table: 'data', equations: 'data', scatter: 'data', tutor: 'data', report: 'data', signal: 'data', vxSignal: 'data', vySignal: 'data', params: 'ctrl', guide: 'ctrl', stats: 'ctrl' },
    defaultColumnOrder: { data: ['table', 'signal', 'vxSignal', 'vySignal'], vis: [], ctrl: ['params'] },
    panelTitles: { table: t('experiments.panelTable'), equations: t('experiments.panelEquations'), scatter: t('experiments.panelChart'), tutor: t('experiments.panelResults'), report: t('experiments.panelReport'), signal: t('experiments.panelSignal'), vxSignal: t('experiments.panelSignal'), vySignal: t('experiments.panelSignal'), params: t('experiments.panelParams'), guide: t('experiments.guidePanel'), stats: t('experiments.panelStats') },
  })
}
