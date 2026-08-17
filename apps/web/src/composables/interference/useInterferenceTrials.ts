import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface InterferenceTrial {
  id: number
  slitDistance: number
  screenDistance: number
  wavelength: number
  slitWidth: number
  fringeSpacing: number
}

export function useInterferenceTrials(
  params: { value: { slitDistance: number; screenDistance: number; wavelength: number; slitWidth: number } },
  fringeSpacing: { value: number },
) {
  const base = useExperimentTrials<InterferenceTrial>({ storageKey: 'interference:trials:v1' })

  function recordTrial() {
    const { slitDistance, screenDistance, wavelength, slitWidth } = params.value
    base.addTrial({ slitDistance, screenDistance, wavelength, slitWidth, fringeSpacing: fringeSpacing.value })
  }

  function exportCsv() {
    base.exportCsv(`interference_${Date.now()}.csv`, [
      ['Trial', 'd(mm)', 'D(m)', 'lambda(nm)', 'a(um)', 'delta_y(mm)'],
      ...base.trials.value.map(tr => [tr.id, tr.slitDistance.toFixed(2), tr.screenDistance.toFixed(2), tr.wavelength, tr.slitWidth.toFixed(3), tr.fringeSpacing.toFixed(3)]),
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
