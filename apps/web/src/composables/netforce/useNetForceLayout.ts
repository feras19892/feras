import { useExperimentLayout, type ColumnId } from '../experiment/shared/useExperimentLayout'
import { useI18n } from '../useI18n'

export type { ColumnId }

export function useNetForceLayout() {
  const { t } = useI18n()

  return useExperimentLayout({
    storageKey: 'netforce:layout:v1',
    panelIds: ['table', 'equations', 'fbd', 'tutor', 'report', 'params', 'guide', 'stats'],
    defaultVisible: { table: true, equations: true, fbd: true, tutor: false, report: false, params: true, guide: false, stats: false },
    defaultPanelColumn: { table: 'data', equations: 'data', fbd: 'data', tutor: 'data', report: 'data', params: 'ctrl', guide: 'ctrl', stats: 'ctrl' },
    defaultColumnOrder: { data: ['table', 'equations', 'fbd'], vis: [], ctrl: ['params', 'stats'] },
    panelTitles: { table: t('experiments.panelTrials'), equations: t('experiments.panelLaws'), fbd: 'مخطط الجسم الحر', tutor: t('experiments.panelResults'), report: 'التقرير', params: t('experiments.panelParams'), guide: 'الدليل', stats: 'الإحصاءات' },
  })
}
