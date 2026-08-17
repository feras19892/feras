import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface SpecificHeatTrial {
  id: number
  metalType: string
  metalMass: number
  metalTemp: number
  waterMass: number
  waterTemp: number
  finalTemp: number
  cExtracted: number
  cTrue: number
}

export function useSpecificHeatTrials(
  paramsGetter: { get value(): { metalType: string; metalMass: number; metalTemp: number; waterMass: number; waterTemp: number; finalTemp: number; cExtracted: number; cTrue: number } },
) {
  const base = useExperimentTrials<SpecificHeatTrial>({ storageKey: 'specificheat_trials_v2' })

  function recordTrial() {
    const p = paramsGetter.value
    base.addTrial({ metalType: p.metalType, metalMass: p.metalMass, metalTemp: p.metalTemp, waterMass: p.waterMass, waterTemp: p.waterTemp, finalTemp: p.finalTemp, cExtracted: p.cExtracted, cTrue: p.cTrue })
  }

  function exportCsv() {
    base.exportCsv('specific_heat_mixture_trials.csv', [
      ['ID', 'MetalType', 'MetalMass(kg)', 'MetalTemp(C)', 'WaterMass(kg)', 'WaterTemp(C)', 'FinalTemp(C)', 'cExtracted(J/kgK)', 'cTrue(J/kgK)'],
      ...base.trials.value.map(tr => [tr.id, tr.metalType, tr.metalMass.toFixed(3), tr.metalTemp, tr.waterMass.toFixed(3), tr.waterTemp, tr.finalTemp.toFixed(2), tr.cExtracted.toFixed(1), tr.cTrue.toFixed(1)]),
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
