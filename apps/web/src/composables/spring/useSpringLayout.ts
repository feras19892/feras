import { useExperimentLayout, type ColumnId } from '../experiment/shared/useExperimentLayout'
import { useI18n } from '../useI18n'

export type { ColumnId }
export type PanelId = 'table' | 'signal' | 'params'

export function useSpringLayout() {
  const { t } = useI18n()

  return useExperimentLayout({
    storageKey: 'spring:layout:v2',
    clearOldKey: 'spring:layout:v1',
    panelIds: ['table', 'signal', 'params'],
    defaultPanelColumn: {
      table: 'data', signal: 'data', params: 'ctrl',
    },
    defaultColumnOrder: {
      data: ['table', 'signal'], vis: [], ctrl: ['params'],
    },
    panelTitles: {
      table: t('experiments.panelTable'),
      signal: t('experiments.panelSignal'),
      params: t('experiments.panelParams'),
    },
  })
}
