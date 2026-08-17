import { useExperimentTrials } from '../experiment/shared/useExperimentTrials'

export interface ResonanceTrial {
  id: number
  stringLength: number
  tension: number
  harmonic: number
  frequency: number
  wavelength: number
}

export function useResonanceTrials(
  params: { value: { stringLength: number; tension: number; harmonic: number } },
  frequency: { value: number },
  wavelength: { value: number },
) {
  const base = useExperimentTrials<ResonanceTrial>({ storageKey: 'resonance:trials:v1' })

  function recordTrial() {
    const { stringLength, tension, harmonic } = params.value
    base.addTrial({ stringLength, tension, harmonic, frequency: frequency.value, wavelength: wavelength.value })
  }

  function exportCsv() {
    base.exportCsv('resonance-trials.csv', [
      ['Trial', 'L(m)', 'T(N)', 'n', 'f(Hz)', 'lambda(m)'],
      ...base.trials.value.map(tr => [tr.id, tr.stringLength.toFixed(3), tr.tension.toFixed(1), tr.harmonic, tr.frequency.toFixed(1), tr.wavelength.toFixed(3)]),
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
