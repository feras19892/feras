import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface DiffractionTrial {
  id: number
  mode: 'single' | 'grating'
  slitWidth: number
  linesPerMm: number
  screenDistance: number
  wavelength: number
  centralWidth: number
  darkFringe1: number
  firstOrderAngle: number
  firstOrderY: number
}

export function useDiffractionTrials(
  params: { value: { slitWidth: number; linesPerMm: number; screenDistance: number; wavelength: number } },
  mode: { value: 'single' | 'grating' },
  centralWidth: { value: number },
  darkFringe1: { value: number },
  firstOrderAngle: { value: number },
  firstOrderY: { value: number },
) {
  const base = useExperimentTrials<DiffractionTrial>({ storageKey: 'diffraction:trials:v1' })

  function recordTrial() {
    const { slitWidth, linesPerMm, screenDistance, wavelength } = params.value
    base.addTrial({ mode: mode.value, slitWidth, linesPerMm, screenDistance, wavelength, centralWidth: centralWidth.value, darkFringe1: darkFringe1.value, firstOrderAngle: firstOrderAngle.value, firstOrderY: firstOrderY.value })
  }

  function exportCsv() {
    base.exportCsv('diffraction-trials.csv', [
      ['Trial', 'Mode', 'a(mm)', 'N(lines/mm)', 'D(m)', 'lambda(nm)', 'w(mm)', 'y1(mm)', 'theta1(deg)', 'y1_grating(mm)'],
      ...base.trials.value.map(tr => [tr.id, tr.mode, tr.slitWidth.toFixed(2), tr.linesPerMm, tr.screenDistance.toFixed(2), tr.wavelength, tr.centralWidth.toFixed(2), tr.darkFringe1.toFixed(2), tr.firstOrderAngle.toFixed(3), tr.firstOrderY.toFixed(3)]),
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
