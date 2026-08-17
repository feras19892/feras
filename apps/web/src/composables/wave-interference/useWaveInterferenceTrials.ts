import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface WaveInterferenceTrial {
  id: number
  sourceDistance: number
  wavelength: number
  frequency: number
  screenDistance: number
  pathDiffCentral: number
}

export function useWaveInterferenceTrials(
  params: { value: { sourceDistance: number; wavelength: number; frequency: number; screenDistance: number } },
  pathDiffCentral: { value: number },
) {
  const base = useExperimentTrials<WaveInterferenceTrial>({ storageKey: 'waveinterference:trials:v1' })

  function recordTrial() {
    const { sourceDistance, wavelength, frequency, screenDistance } = params.value
    base.addTrial({ sourceDistance, wavelength, frequency, screenDistance, pathDiffCentral: pathDiffCentral.value })
  }

  function exportCsv() {
    base.exportCsv('wave-interference-trials.csv', [
      ['Trial', 'd(m)', 'lambda(m)', 'f(Hz)', 'D(m)', 'delta_r(m)'],
      ...base.trials.value.map(tr => [tr.id, tr.sourceDistance.toFixed(3), tr.wavelength.toFixed(4), tr.frequency.toFixed(1), tr.screenDistance.toFixed(2), tr.pathDiffCentral.toFixed(4)]),
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
