import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface GratingTrial {
  id: number
  linesPerMm: number
  screenDistance: number
  wavelength: number
  maxOrder: number
  firstOrderAngle: number
  firstOrderY: number
}

export function useGratingTrials(
  params: { value: { linesPerMm: number; screenDistance: number; wavelength: number } },
  maxOrder: { value: number },
  firstOrderAngle: { value: number },
  firstOrderY: { value: number },
) {
  const base = useExperimentTrials<GratingTrial>({ storageKey: 'grating:trials:v1' })

  function recordTrial() {
    const { linesPerMm, screenDistance, wavelength } = params.value
    base.addTrial({ linesPerMm, screenDistance, wavelength, maxOrder: maxOrder.value, firstOrderAngle: firstOrderAngle.value, firstOrderY: firstOrderY.value })
  }

  function exportCsv() {
    base.exportCsv('grating-trials.csv', [
      ['Trial', 'N(lines/mm)', 'D(m)', 'lambda(nm)', 'maxOrder', 'theta1(deg)', 'y1(mm)'],
      ...base.trials.value.map(tr => [tr.id, tr.linesPerMm, tr.screenDistance.toFixed(2), tr.wavelength, tr.maxOrder, tr.firstOrderAngle.toFixed(3), tr.firstOrderY.toFixed(3)]),
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
