import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface CalorimetryTrial {
  id: number
  mWater: number
  tWater: number
  mMetal: number
  tMetal: number
  tf: number
  cMetal: number
  cTrue?: number
}

export function useCalorimetryTrials(
  params: { value: { mWater: number; tWater: number; mMetal: number; tMetal: number; tf: number; cMetal: number; cTrue?: number } },
) {
  const base = useExperimentTrials<CalorimetryTrial>({ storageKey: 'calorimetry:trials:v1' })

  function recordTrial() {
    const { mWater, tWater, mMetal, tMetal, tf, cMetal, cTrue } = params.value
    base.addTrial({ mWater, tWater, mMetal, tMetal, tf, cMetal, cTrue })
  }

  function exportCsv() {
    base.exportCsv('calorimetry_trials.csv', [
      ['Trial', 'mWater(kg)', 'tWater(C)', 'mMetal(kg)', 'tMetal(C)', 'tf(C)', 'cMetal(J/kgK)'],
      ...base.trials.value.map(tr => [tr.id, tr.mWater.toFixed(3), tr.tWater.toFixed(1), tr.mMetal.toFixed(3), tr.tMetal.toFixed(1), tr.tf.toFixed(1), tr.cMetal.toFixed(0)]),
    ])
  }

  return {
    trials: base.trials,
    recordTrial,
    removeTrial: base.removeTrial,
    clearTrials: base.clearTrials,
    undo: base.undo,
    redo: base.redo,
    canUndo: base.canUndo,
    canRedo: base.canRedo,
    autoLoad: base.autoLoad,
    exportCsv,
  }
}
