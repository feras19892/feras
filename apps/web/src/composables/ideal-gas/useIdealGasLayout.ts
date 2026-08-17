import { useExperimentLayout, type ColumnId } from '../experiment/shared/useExperimentLayout'
import { useI18n } from '../useI18n'

export type { ColumnId }

export function useIdealGasLayout() {
  const { t } = useI18n()

  return useExperimentLayout({
    storageKey: 'idealgas_layout_v2',
    clearOldKey: 'idealgas_layout_v1',
    panelIds: ['readings', 'chart', 'trials', 'params', 'laws', 'results'],
    defaultVisible: { readings: false, chart: true, trials: true, params: true, laws: false, results: false },
    defaultPanelColumn: { readings: 'data', chart: 'data', trials: 'data', params: 'ctrl', laws: 'ctrl', results: 'ctrl' },
    defaultColumnOrder: { data: ['chart', 'trials'], vis: [], ctrl: ['params'] },
    panelTitles: { readings: t('experiments.panelReadings'), chart: t('experiments.panelChart'), trials: t('experiments.panelTrials'), params: t('experiments.panelParams'), laws: t('experiments.panelLaws'), results: t('experiments.panelResults') },
  })
}
